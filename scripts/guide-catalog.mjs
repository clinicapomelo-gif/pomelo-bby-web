#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rename, rm, stat, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, extname, join, resolve } from 'node:path';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import Stripe from 'stripe';
import {
  GUIDE_BENEFITS_COUNT,
  GUIDE_CATEGORIES,
  GUIDE_KINDS,
  MAX_BENEFIT_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_GUIDE_PAGE_COUNT,
  MAX_SLUG_LENGTH,
  MAX_TITLE_LENGTH,
  assertProvisionAllowed,
  parseEuroCents,
  pdfSha256,
  priceFingerprint,
  slugify,
  updateTestPrice,
  upsertTestGuide,
  validateCatalog,
  validatePdf,
  validatePdfStat,
} from './guide-catalog-core.mjs';

const root = resolve(import.meta.dirname, '..');
const catalogPath = resolve(root, 'src/data/guias.json');
const APP = 'pomelo-bby';
// PDF privados en Cloudflare R2. Usa la sesión de `npx wrangler login`.
const R2_BUCKET = 'pomelo-guias';
const wranglerBin = resolve(root, 'node_modules/.bin/wrangler');
const r2 = (...args) => promisify(execFile)(wranglerBin, ['r2', 'object', ...args, '--remote'], { cwd: root });

class SafeError extends Error {}
const fail = (message) => { throw new SafeError(message); };

function parseArgs(argv) {
  const options = {};
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--apply') options.apply = true;
    else if (argument === '--yes') options.yes = true;
    else if (argument.startsWith('--')) {
      const name = argument.slice(2);
      if (!['pdf', 'title', 'slug', 'kind', 'pages', 'category', 'description', 'price', 'benefit1', 'benefit2', 'benefit3'].includes(name)) fail(`Opción desconocida: --${name}`);
      const value = argv[index += 1];
      if (!value || value.startsWith('--')) fail(`Falta el valor de --${name}.`);
      options[name] = value;
    } else positional.push(argument);
  }
  return { options, positional };
}

async function loadCatalog() {
  let source;
  try { source = await readFile(catalogPath, 'utf8'); }
  catch { fail('No se pudo leer el catálogo.'); }
  let catalog;
  try { catalog = JSON.parse(source); validateCatalog(catalog); }
  catch (error) { fail(`El catálogo no es válido: ${error instanceof Error ? error.message : 'error desconocido'}`); }
  return { catalog, source };
}

function stripeClient() {
  const key = process.env.STRIPE_CATALOG_KEY;
  if (!key?.startsWith('rk_test_') || key.toUpperCase().includes('PLACEHOLDER')) {
    fail('STRIPE_CATALOG_KEY debe ser una clave restringida de Stripe test. Las claves secretas completas y live se rechazan.');
  }
  return new Stripe(key);
}

async function ask(rl, label, fallback = '') {
  const suffix = fallback ? ` [${fallback}]` : '';
  const answer = (await rl.question(`${label}${suffix}: `)).trim();
  return answer || fallback;
}

async function allPages(fetchPage) {
  const items = [];
  let startingAfter;
  do {
    const page = await fetchPage(startingAfter);
    items.push(...page.data);
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (startingAfter);
  return items;
}

const productId = (value) => typeof value === 'string' ? value : value?.id;
const defaultPriceId = (product) => typeof product.default_price === 'string' ? product.default_price : product.default_price?.id;

function verifyProduct(product, guiaId) {
  if (!product || product.deleted || !product.active || product.livemode || product.metadata?.app !== APP || product.metadata?.guiaId !== guiaId) {
    fail('El Product de Stripe no pertenece a esta guía en modo test.');
  }
}

function verifyPrice(price, expectedProductId, amountCents) {
  if (
    !price || price.livemode || price.active === false || price.currency !== 'eur' ||
    price.unit_amount !== amountCents || price.type !== 'one_time' || productId(price.product) !== expectedProductId
  ) fail('El Price de Stripe no coincide exactamente con Product, EUR, importe, pago único y modo test.');
}

async function findProduct(stripe, guiaId, catalogProductId) {
  const products = await allPages((starting_after) => stripe.products.list({ limit: 100, ...(starting_after ? { starting_after } : {}) }));
  const metadataMatches = products.filter((product) => product.metadata?.app === APP && product.metadata?.guiaId === guiaId);
  if (metadataMatches.length > 1) fail('Hay más de un Product de Stripe para esta guía.');
  if (metadataMatches.length === 1) {
    if (catalogProductId && metadataMatches[0].id !== catalogProductId) fail('El Product del catálogo no coincide con el reconciliado en Stripe.');
    verifyProduct(metadataMatches[0], guiaId);
    return { product: metadataMatches[0], needsMetadata: false };
  }
  if (!catalogProductId) return { product: undefined, needsMetadata: false };

  let product;
  try { product = await stripe.products.retrieve(catalogProductId); }
  catch { fail('No se pudo recuperar el Product test guardado en el catálogo.'); }
  if (product.livemode || product.deleted || !product.active || (product.metadata?.app && product.metadata.app !== APP) || (product.metadata?.guiaId && product.metadata.guiaId !== guiaId)) {
    fail('El Product guardado no se puede adoptar de forma segura.');
  }
  return { product, needsMetadata: true };
}

async function findExactPrice(stripe, stripeProductId, amountCents) {
  const prices = await allPages((starting_after) => stripe.prices.list({
    product: stripeProductId,
    limit: 100,
    ...(starting_after ? { starting_after } : {}),
  }));
  const exact = prices.filter((price) =>
    !price.livemode && price.active && price.currency === 'eur' && price.unit_amount === amountCents && price.type === 'one_time');
  if (exact.length > 1) fail('Ya hay Prices duplicados con el mismo importe; hay que resolverlos manualmente.');
  if (exact[0]) verifyPrice(exact[0], stripeProductId, amountCents);
  return exact[0];
}

async function inspectBlob(blobKey, expectedSize, expectedSha256) {
  const dir = await mkdtemp(join(tmpdir(), 'pomelo-r2-'));
  const file = join(dir, 'guia.pdf');
  try {
    try {
      await r2('get', `${R2_BUCKET}/${blobKey}`, '--file', file);
    } catch (error) {
      if (`${error.stdout ?? ''}${error.stderr ?? ''}`.includes('The specified key does not exist')) return false;
      fail('No se pudo comprobar R2. ¿Has iniciado sesión con `npx wrangler login`?');
    }

    const content = await readFile(file);
    if (content.length !== expectedSize || createHash('sha256').update(content).digest('hex') !== expectedSha256) {
      fail('El PDF existente en R2 no coincide exactamente con el PDF local.');
    }
    return true;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function runBuild() {
  const exitCode = await new Promise((resolveExit) => {
    const child = spawn('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
    child.on('error', () => resolveExit(1));
    child.on('exit', (code) => resolveExit(code ?? 1));
  });
  if (exitCode !== 0) {
    fail('El build falló. Los recursos externos y el catálogo pueden haberse creado o actualizado ya; no se ha intentado revertirlos.');
  }
}

async function saveCatalog(originalSource, catalog) {
  const current = await readFile(catalogPath, 'utf8');
  if (current !== originalSource) fail('El catálogo cambió durante la operación; no se ha sobrescrito.');
  const temporary = `${catalogPath}.${process.pid}.tmp`;
  try {
    await writeFile(temporary, `${JSON.stringify(catalog, null, 2)}\n`, { mode: 0o644, flag: 'wx' });
    await rename(temporary, catalogPath);
  } catch (error) {
    await unlink(temporary).catch(() => {});
    if (error instanceof SafeError) throw error;
    fail('No se pudo actualizar el catálogo de forma atómica.');
  }
}

async function confirmApply(rl, apply, yes = false) {
  if (!apply) return false;
  if (yes) return true;
  const answer = await rl.question('Escribe APLICAR para confirmar los cambios en Stripe test, R2 y catálogo: ');
  if (answer.trim() !== 'APLICAR') fail('Operación cancelada sin cambios.');
  return true;
}

async function provision(args, rl) {
  const { options, positional } = parseArgs(args);
  if (positional.length !== 0) fail('Usa --pdf para indicar el archivo, no un argumento posicional.');
  const pdfInput = options.pdf ?? await ask(rl, 'Ruta local del PDF');
  if (!pdfInput) fail('Falta la ruta local del PDF.');
  const pdfPath = resolve(pdfInput);
  let pdfStat;
  try { pdfStat = await stat(pdfPath); }
  catch { fail('No se pudo examinar el PDF indicado.'); }
  validatePdfStat(pdfStat);
  let pdf;
  try { pdf = await readFile(pdfPath); }
  catch { fail('No se pudo leer el PDF indicado.'); }
  validatePdf(pdf, pdfStat);

  const { catalog, source } = await loadCatalog();
  const proposedTitle = basename(pdfPath, extname(pdfPath)).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  let title = options.title?.trim();
  let slug = options.slug?.trim();
  if (!slug) {
    title ||= await ask(rl, 'Título (la propuesta procede solo del nombre del archivo)', proposedTitle);
    slug = await ask(rl, 'Slug', slugify(title));
  }
  if (slugify(slug) !== slug || !slug) fail('El slug no es válido.');
  const existing = catalog.find((guide) => guide.id === slug);
  title ||= await ask(
    rl,
    'Título (la propuesta procede solo del nombre del archivo)',
    existing?.title ?? proposedTitle,
  );
  title = title.trim();
  const kind = (options.kind ?? await ask(rl, `Tipo (${GUIDE_KINDS.join(', ')})`, existing?.kind ?? '')).trim();
  const pageCountText = (options.pages ?? await ask(rl, 'Número de páginas', existing?.pageCount ? String(existing.pageCount) : '')).trim();
  const pageCount = /^\d+$/.test(pageCountText) ? Number(pageCountText) : 0;
  const category = (options.category ?? await ask(rl, `Categoría (${GUIDE_CATEGORIES.join(', ')})`, existing?.category ?? '')).trim();
  const description = (options.description ?? await ask(rl, 'Descripción aprobada (no se extrae del PDF)', existing?.description ?? '')).trim();
  const benefits = [];
  for (let index = 0; index < GUIDE_BENEFITS_COUNT; index += 1) {
    const option = options[`benefit${index + 1}`];
    benefits.push(option ?? existing?.benefits?.[index] ?? await ask(rl, `Beneficio ${index + 1} aprobado`));
  }
  const existingTestAmount = existing?.stripe?.test?.amountCents ?? existing?.amountCents;
  const priceText = options.price ?? await ask(
    rl,
    'Precio EUR con dos decimales',
    existingTestAmount === undefined ? '' : (existingTestAmount / 100).toFixed(2),
  );
  const amountCents = parseEuroCents(priceText);
  if (
    title.length < 3 || title.length > MAX_TITLE_LENGTH ||
    description.length < 10 || description.length > MAX_DESCRIPTION_LENGTH ||
    benefits.some((benefit) => benefit.length < 3 || benefit.length > MAX_BENEFIT_LENGTH) ||
    slug.length > MAX_SLUG_LENGTH ||
    !GUIDE_KINDS.includes(kind) ||
    !Number.isSafeInteger(pageCount) || pageCount < 1 || pageCount > MAX_GUIDE_PAGE_COUNT ||
    !GUIDE_CATEGORIES.includes(category)
  ) fail('Título, slug, tipo, páginas, categoría, descripción o beneficios no son válidos.');

  const sha256 = pdfSha256(pdf);
  // Existing paid guides retain their exact legacy pathname, including Unicode normalization.
  const blobKey = existing?.blobKey ?? `guias/${slug}/${sha256}.pdf`;
  const guideInput = { id: slug, title, description, benefits, kind, pageCount, category, blobKey, stripe: {}, amountCents, status: 'testing' };
  try { assertProvisionAllowed(existing, guideInput, amountCents); }
  catch (error) { fail(error instanceof Error ? error.message : 'La guía no se puede provisionar.'); }

  const stripe = stripeClient();
  const blobExists = await inspectBlob(blobKey, pdf.length, sha256);
  const exactRerun = existing?.status === 'testing' || existing?.status === 'available';
  if (exactRerun && !blobExists) fail('El PDF existente no coincide con el archivo local; provision no puede sustituirlo.');
  let reconciliation;
  try { reconciliation = await findProduct(stripe, slug, existing?.stripe?.test?.productId); }
  catch (error) { if (error instanceof SafeError) throw error; fail('No se pudo reconciliar Stripe test.'); }
  let exactPrice;
  if (reconciliation.product) {
    try { exactPrice = await findExactPrice(stripe, reconciliation.product.id, amountCents); }
    catch (error) { if (error instanceof SafeError) throw error; fail('No se pudo reconciliar el Price test.'); }
  }
  if (exactRerun && (
    !reconciliation.product ||
    !exactPrice ||
    exactPrice.id !== existing.stripe.test.priceId ||
    defaultPriceId(reconciliation.product) !== existing.stripe.test.priceId
  )) fail('La guía existente no coincide exactamente con Stripe test. Usa guide:price o resuelve la discrepancia manualmente.');

  console.log(`Resumen: archivo ${JSON.stringify(basename(pdfPath))}; título ${JSON.stringify(title)}; slug ${slug}; tipo ${kind}; páginas ${pageCount}; categoría ${category}; precio ${(amountCents / 100).toFixed(2)} EUR.`);
  console.log(exactRerun
    ? 'Plan: verificar una repetición exacta sin cambiar PDF, Product, Price ni catálogo.'
    : `Plan: ${blobExists ? 'reutilizar' : 'subir'} PDF privado; ${reconciliation.product ? 'reutilizar' : 'crear'} Product test; ${exactPrice ? 'reutilizar' : 'crear'} Price test; actualizar catálogo.`);
  if (!await confirmApply(rl, options.apply, options.yes)) {
    console.log('Dry-run terminado. No se ha modificado nada. Usa --apply para aplicar el plan.');
    return;
  }
  if (exactRerun) {
    console.log('La guía ya coincide exactamente. No se ha modificado nada.');
    return;
  }

  if (!blobExists) {
    try {
      // Sin sobrescritura: inspectBlob ya ha comprobado que la clave no existe.
      const dir = await mkdtemp(join(tmpdir(), 'pomelo-r2-'));
      try {
        await writeFile(join(dir, 'guia.pdf'), pdf);
        await r2('put', `${R2_BUCKET}/${blobKey}`, '--file', join(dir, 'guia.pdf'), '--content-type', 'application/pdf');
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    } catch (error) {
      if (error instanceof SafeError) throw error;
      // A concurrent/partial prior run may have completed the exact content-addressed upload.
      if (!await inspectBlob(blobKey, pdf.length, sha256)) fail('No se pudo subir el PDF privado.');
    }
  }

  let product = reconciliation.product;
  try {
    if (!product) {
      product = await stripe.products.create(
        { name: title, description, metadata: { app: APP, guiaId: slug } },
        { idempotencyKey: `pomelo-guide-product-${slug}` },
      );
    } else {
      product = await stripe.products.update(product.id, { name: title, description, metadata: { app: APP, guiaId: slug } });
    }
    verifyProduct(product, slug);
  } catch (error) { if (error instanceof SafeError) throw error; fail('No se pudo crear o actualizar el Product test.'); }

  let price = exactPrice;
  try {
    price ??= await findExactPrice(stripe, product.id, amountCents);
    price ??= await stripe.prices.create(
      {
        product: product.id,
        currency: 'eur',
        unit_amount: amountCents,
        metadata: { app: APP, guiaId: slug, fingerprint: priceFingerprint(slug, amountCents) },
      },
      { idempotencyKey: `pomelo-guide-price-${priceFingerprint(slug, amountCents)}` },
    );
    verifyPrice(price, product.id, amountCents);
    product = await stripe.products.update(product.id, { default_price: price.id });
    if (defaultPriceId(product) !== price.id) fail('Stripe no confirmó el Price predeterminado.');
  } catch (error) { if (error instanceof SafeError) throw error; fail('No se pudo reconciliar el Price test.'); }

  const next = upsertTestGuide(catalog, guideInput, {
    productId: product.id, priceId: price.id, amountCents: price.unit_amount,
  });
  await saveCatalog(source, next);
  await runBuild();
  console.log('Guía provisionada en Stripe test, R2 privado y catálogo. Sigue en estado testing y el build es válido.');
}

async function updatePrice(args, rl) {
  const { options, positional } = parseArgs(args);
  if (positional.length !== 1) fail('Uso: guide:price -- <guiaId> [--price 5,99] [--apply]');
  const guiaId = positional[0];
  const { catalog, source } = await loadCatalog();
  const guide = catalog.find((item) => item.id === guiaId);
  if (!guide?.stripe?.test || !['testing', 'available'].includes(guide.status)) {
    fail('La guía no admite cambios de precio test.');
  }
  const amountCents = parseEuroCents(options.price ?? await ask(rl, 'Nuevo precio EUR con dos decimales'));
  const stripe = stripeClient();

  let reconciliation;
  let exactPrice;
  try {
    reconciliation = await findProduct(stripe, guiaId, guide.stripe.test.productId);
    if (!reconciliation.product) fail('No se encontró el Product test de la guía.');
    exactPrice = await findExactPrice(stripe, reconciliation.product.id, amountCents);
  } catch (error) { if (error instanceof SafeError) throw error; fail('No se pudo reconciliar Stripe test.'); }

  console.log(`Resumen: slug ${guiaId}; categoría ${guide.category}; precio ${(amountCents / 100).toFixed(2)} EUR.`);
  console.log(`Plan: ${exactPrice ? 'reutilizar' : 'crear'} Price test, establecerlo como predeterminado y actualizar el catálogo. Los Prices anteriores seguirán activos.`);
  if (!await confirmApply(rl, options.apply, options.yes)) {
    console.log('Dry-run terminado. No se ha modificado nada. Usa --apply para aplicar el plan.');
    return;
  }

  let price = exactPrice;
  let product = reconciliation.product;
  try {
    product = await stripe.products.update(product.id, {
      name: guide.title,
      description: guide.description,
      metadata: { app: APP, guiaId },
    });
    verifyProduct(product, guiaId);
    price ??= await findExactPrice(stripe, product.id, amountCents);
    price ??= await stripe.prices.create(
      {
        product: product.id,
        currency: 'eur',
        unit_amount: amountCents,
        metadata: { app: APP, guiaId, fingerprint: priceFingerprint(guiaId, amountCents) },
      },
      { idempotencyKey: `pomelo-guide-price-${priceFingerprint(guiaId, amountCents)}` },
    );
    verifyPrice(price, product.id, amountCents);
    product = await stripe.products.update(product.id, { default_price: price.id });
    if (defaultPriceId(product) !== price.id) fail('Stripe no confirmó el Price predeterminado.');
  } catch (error) { if (error instanceof SafeError) throw error; fail('No se pudo actualizar el Price test.'); }

  const next = updateTestPrice(catalog, guiaId, {
    productId: product.id,
    priceId: price.id,
    amountCents: price.unit_amount,
  });
  await saveCatalog(source, next);
  await runBuild();
  console.log('Precio test actualizado y build válido. Los Prices anteriores permanecen activos para compras históricas.');
}

const [command, ...args] = process.argv.slice(2);
const rl = createInterface({ input: stdin, output: stdout });
try {
  if (command === 'provision') await provision(args, rl);
  else if (command === 'price') await updatePrice(args, rl);
  else fail('Comandos: provision | price <guiaId>. Dry-run por defecto; --apply para aplicar.');
} catch (error) {
  console.error(error instanceof SafeError
    ? error.message
    : 'La operación falló. Puede haber recursos externos creados; ejecuta de nuevo el dry-run antes de continuar.');
  process.exitCode = 1;
} finally {
  rl.close();
}
