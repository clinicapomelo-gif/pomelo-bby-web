#!/usr/bin/env node
import { readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import Stripe from 'stripe';
import { validateCatalog } from './guide-catalog-core.mjs';

const root = resolve(import.meta.dirname, '..');
const catalogPath = resolve(root, 'src/data/guias.json');
const APP = 'pomelo-bby';

class SafeError extends Error {}
const fail = (message) => { throw new SafeError(message); };

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

function parseArgs(argv) {
  const options = { apply: false, yes: false };
  for (const argument of argv) {
    if (argument === '--apply') options.apply = true;
    else if (argument === '--yes') options.yes = true;
    else fail(`Opción desconocida: ${argument}`);
  }
  return options;
}

function getLiveStripe() {
  const key = process.env.STRIPE_LIVE_SECRET_KEY;
  if (!key?.startsWith('sk_live_') || key.toUpperCase().includes('PLACEHOLDER')) {
    fail('STRIPE_LIVE_SECRET_KEY debe ser una clave secreta Live configurada solo en tu .env local.');
  }
  return new Stripe(key);
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

function paidGuides(catalog) {
  return catalog.filter((guide) => guide.status === 'available' && guide.amountCents > 0);
}

async function findLiveMappings(stripe, guides) {
  const expectedById = new Map(guides.map((guide) => [guide.id, guide]));
  const products = await allPages((startingAfter) => stripe.products.list({
    active: true,
    limit: 100,
    ...(startingAfter ? { starting_after: startingAfter } : {}),
  }));
  const matching = products.filter((product) =>
    product.livemode &&
    product.metadata?.app === APP &&
    expectedById.has(product.metadata?.guiaId),
  );
  const productsByGuide = new Map();
  for (const product of matching) {
    const guideId = product.metadata.guiaId;
    if (productsByGuide.has(guideId)) fail(`Hay más de un Product Live para ${guideId}.`);
    productsByGuide.set(guideId, product);
  }

  const mappings = new Map();
  for (const guide of guides) {
    const product = productsByGuide.get(guide.id);
    if (!product) fail(`No se encontró el Product Live de ${guide.id}. Debe conservar metadata app=${APP} y guiaId=${guide.id}.`);
    const priceId = typeof product.default_price === 'string' ? product.default_price : product.default_price?.id;
    if (!priceId) fail(`El Product Live de ${guide.id} no tiene Price predeterminado.`);
    const price = await stripe.prices.retrieve(priceId);
    if (
      !price.livemode || !price.active || price.currency !== 'eur' ||
      price.type !== 'one_time' || price.unit_amount !== guide.amountCents ||
      (typeof price.product === 'string' ? price.product : price.product.id) !== product.id
    ) fail(`El Price predeterminado Live de ${guide.id} no coincide con EUR, pago único e importe ${guide.amountCents / 100}.`);
    mappings.set(guide.id, { productId: product.id, priceId: price.id, amountCents: price.unit_amount });
  }
  return mappings;
}

function applyMappings(catalog, mappings) {
  const next = structuredClone(catalog);
  for (const guide of next) {
    const live = mappings.get(guide.id);
    if (!live) continue;
    const existing = guide.stripe.live;
    if (existing && JSON.stringify(existing) !== JSON.stringify(live)) {
      fail(`El mapeo Live existente de ${guide.id} no coincide. Revísalo manualmente antes de sobrescribirlo.`);
    }
    guide.stripe.live = live;
  }
  return validateCatalog(next);
}

async function saveCatalog(source, catalog) {
  const current = await readFile(catalogPath, 'utf8');
  if (current !== source) fail('El catálogo cambió durante la operación; no se ha sobrescrito.');
  const temporary = `${catalogPath}.${process.pid}.tmp`;
  try {
    await writeFile(temporary, `${JSON.stringify(catalog, null, 2)}\n`, { mode: 0o644, flag: 'wx' });
    await rename(temporary, catalogPath);
  } catch {
    await unlink(temporary).catch(() => {});
    fail('No se pudo actualizar el catálogo de forma atómica.');
  }
}

const options = parseArgs(process.argv.slice(2));
const rl = createInterface({ input: stdin, output: stdout });
try {
  const { catalog, source } = await loadCatalog();
  const guides = paidGuides(catalog);
  const mappings = await findLiveMappings(getLiveStripe(), guides);
  console.log(`Plan: añadir ${mappings.size} mapeos stripe.live al catálogo local. Stripe Live solo se ha leído.`);
  for (const [guideId, mapping] of mappings) console.log(`${guideId}: ${mapping.productId} / ${mapping.priceId}`);
  if (!options.apply) {
    console.log('Dry-run terminado. No se ha modificado nada. Usa --apply para guardar el catálogo local.');
  } else {
    const answer = options.yes ? 'APLICAR' : await rl.question('Escribe APLICAR para guardar solo el catálogo local: ');
    if (answer.trim() !== 'APLICAR') fail('Operación cancelada sin cambios.');
    await saveCatalog(source, applyMappings(catalog, mappings));
    console.log('Catálogo local actualizado. No se ha modificado Stripe, Vercel ni el estado de las guías.');
  }
} catch (error) {
  console.error(error instanceof SafeError ? error.message : 'No se pudo reconciliar Stripe Live. No se ha modificado el catálogo.');
  process.exitCode = 1;
} finally {
  rl.close();
}
