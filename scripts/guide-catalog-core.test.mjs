import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_SLUG_LENGTH,
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
import {
  authorizeGuidePurchase,
  getGuiaAmountCents,
  getStripeMode,
  isGuiaVisible,
} from '../src/data/guide-logic.mjs';

const paidGuide = () => ({
  id: 'guia-prueba',
  title: 'Guía de prueba',
  description: 'Descripción aprobada de prueba.',
  benefits: ['Beneficio uno', 'Beneficio dos', 'Beneficio tres'],
  amountCents: 399,
  pageCount: 5,
  status: 'testing',
  kind: 'practical',
  category: 'salud',
  blobKey: 'guias/guia-prueba/hash.pdf',
  previousBlobKeys: ['guias/guia-prueba/hash-anterior.pdf'],
  stripe: {
    test: {
      productId: 'prod_test12345',
      priceId: 'price_old12345',
      amountCents: 399,
      previousPriceIds: ['price_older12345'],
    },
  },
});

const provisionInput = (guide = paidGuide()) => ({
  id: guide.id,
  title: guide.title,
  description: guide.description,
  benefits: guide.benefits,
  kind: guide.kind,
  pageCount: guide.pageCount,
  category: guide.category,
  blobKey: guide.blobKey,
  stripe: {},
  amountCents: guide.amountCents,
  status: 'testing',
});

test('normaliza slug y convierte EUR decimal a céntimos sin float', () => {
  assert.equal(slugify('Conservación de Leche'), 'conservacion-de-leche');
  assert.equal(parseEuroCents('17,99'), 1799);
  assert.throws(() => parseEuroCents('17.9'));
});

test('rechaza slug vacío, sobredimensionado e IDs placeholder', () => {
  const empty = paidGuide();
  empty.id = '';
  assert.throws(() => validateCatalog([empty]), /slug válido/);

  const oversized = paidGuide();
  oversized.id = 'a'.repeat(MAX_SLUG_LENGTH + 1);
  assert.throws(() => validateCatalog([oversized]), /slug válido/);

  for (const field of ['productId', 'priceId']) {
    const placeholder = paidGuide();
    placeholder.stripe.test[field] = field === 'productId'
      ? 'prod_PLACEHOLDER123'
      : 'price_PLACEHOLDER123';
    assert.throws(() => validateCatalog([placeholder]), new RegExp(field));
  }
});

test('valida ruta local, Blob no vacío e importes pagados acotados', () => {
  const unsafeUrl = {
    ...paidGuide(),
    status: 'free',
    amountCents: 0,
    stripe: {},
    leadMagnetUrl: '//example.com/recurso',
  };
  delete unsafeUrl.blobKey;
  assert.throws(() => validateCatalog([unsafeUrl]), /ruta local segura/);

  const blankBlob = paidGuide();
  blankBlob.blobKey = '   ';
  assert.throws(() => validateCatalog([blankBlob]), /blobKey/);

  const tooCheap = paidGuide();
  tooCheap.amountCents = 49;
  assert.throws(() => validateCatalog([tooCheap]), /importe/);

  for (const previousBlobKeys of [
    [''],
    ['guias/guia-prueba/hash.pdf'],
    ['guias/guia-prueba/repetido.pdf', 'guias/guia-prueba/repetido.pdf'],
  ]) {
    const invalidHistory = paidGuide();
    invalidHistory.previousBlobKeys = previousBlobKeys;
    assert.throws(() => validateCatalog([invalidHistory]), /previousBlobKeys/);
  }
});

test('valida que el PDF sea un archivo no vacío con firma correcta', () => {
  const pdf = Buffer.from('%PDF-1.7\ncontenido');
  validatePdfStat({ size: pdf.length, isFile: () => true });
  validatePdf(pdf, { size: pdf.length, isFile: () => true });
  assert.throws(() => validatePdfStat({ size: 5, isFile: () => false }), /archivo/);
  assert.throws(() => validatePdfStat({ size: 4, isFile: () => true }), /vacío/);
  assert.throws(() => validatePdf(Buffer.from('no pdf'), { size: 6, isFile: () => true }));
  assert.equal(pdfSha256(pdf), pdfSha256(pdf));
});

test('fingerprint de Price es determinista y depende del importe', () => {
  assert.equal(priceFingerprint('guia', 399), priceFingerprint('guia', 399));
  assert.notEqual(priceFingerprint('guia', 399), priceFingerprint('guia', 499));
});

test('catálogo rechaza slugs duplicados, tipos desconocidos y beneficios incompletos', () => {
  const guide = paidGuide();
  assert.throws(() => validateCatalog([guide, structuredClone(guide)]), /duplicado/);

  const unknownKind = paidGuide();
  unknownKind.kind = 'ebook';
  assert.throws(() => validateCatalog([unknownKind]), /kind/);

  const invalidPages = paidGuide();
  invalidPages.pageCount = 0;
  assert.throws(() => validateCatalog([invalidPages]), /pageCount/);

  guide.benefits.pop();
  assert.throws(() => validateCatalog([guide]), /tres beneficios/);
});

test('permite una ficha coming-soon sin páginas, beneficios ni recursos', () => {
  const coming = {
    id: 'guia-futura',
    title: 'Guía futura',
    description: 'Descripción aprobada de la guía futura.',
    amountCents: 1990,
    status: 'coming-soon',
    kind: 'complete',
    category: 'crianza',
    stripe: {},
  };
  assert.deepEqual(validateCatalog([coming]), [coming]);

  const withBlob = { ...coming, blobKey: 'guias/guia-futura/hash.pdf' };
  assert.throws(() => validateCatalog([withBlob]), /no puede tener PDF/);
});

test('provisión permite solo repetición exacta y conserva históricos y live', () => {
  const original = paidGuide();
  original.status = 'available';
  original.amountCents = 799;
  original.stripe.live = {
    productId: 'prod_live12345',
    priceId: 'price_live12345',
    amountCents: 1299,
  };
  const input = provisionInput(original);
  const mapping = {
    productId: 'prod_test12345',
    priceId: 'price_old12345',
    amountCents: 399,
  };
  const once = upsertTestGuide([original], input, mapping);
  const twice = upsertTestGuide(once, input, mapping);
  assert.deepEqual(twice, once);
  assert.deepEqual(once[0], original);
  assert.equal(once[0].stripe.live.amountCents, 1299);
  assert.deepEqual(once[0].stripe.test.previousPriceIds, ['price_older12345']);
});

test('provisión rechaza sustituir PDF o precio y guías free/archived', () => {
  const original = paidGuide();
  const changedPdf = provisionInput(original);
  changedPdf.blobKey = 'guias/guia-prueba/otro.pdf';
  assert.throws(() => assertProvisionAllowed(original, changedPdf, 399), /repetición exacta/);
  assert.throws(() => assertProvisionAllowed(original, provisionInput(original), 499), /guide:price/);

  for (const status of ['free', 'archived']) {
    const guide = paidGuide();
    guide.status = status;
    if (status === 'free') {
      guide.amountCents = 0;
      guide.stripe = {};
      guide.leadMagnetUrl = '/recurso';
      delete guide.blobKey;
    }
    assert.throws(() => assertProvisionAllowed(guide, provisionInput(paidGuide()), 399), /gratuita o archivada/);
  }
});

test('activa coming-soon solo cuando ficha, importe y recursos están limpios', () => {
  const coming = {
    ...paidGuide(),
    status: 'coming-soon',
    stripe: {},
  };
  delete coming.blobKey;
  delete coming.previousBlobKeys;
  delete coming.pageCount;
  delete coming.benefits;
  const input = { ...provisionInput(paidGuide()), blobKey: 'guias/guia-prueba/new.pdf' };
  const next = upsertTestGuide([coming], input, {
    productId: 'prod_test12345', priceId: 'price_new12345', amountCents: 399,
  });
  assert.equal(next[0].status, 'testing');
  assert.equal(next[0].blobKey, input.blobKey);

  const unsafe = structuredClone(coming);
  unsafe.stripe.live = {
    productId: 'prod_live12345', priceId: 'price_live12345', amountCents: 399,
  };
  assert.throws(() => assertProvisionAllowed(unsafe, input, 399), /segura/);
});

test('cambio test conserva importe live e IDs históricos', () => {
  const guide = paidGuide();
  guide.stripe.live = {
    productId: 'prod_live12345', priceId: 'price_live12345', amountCents: 1299,
  };
  const changed = updateTestPrice([guide], 'guia-prueba', {
    productId: 'prod_test12345', priceId: 'price_new12345', amountCents: 499,
  });
  assert.equal(changed[0].amountCents, 499);
  assert.equal(changed[0].stripe.test.amountCents, 499);
  assert.deepEqual(changed[0].stripe.test.previousPriceIds, ['price_old12345', 'price_older12345']);
  assert.equal(getGuiaAmountCents(changed[0], 'test'), 499);
  assert.equal(getGuiaAmountCents(changed[0], 'live'), 1299);

  const repeated = updateTestPrice(changed, 'guia-prueba', {
    productId: 'prod_test12345', priceId: 'price_new12345', amountCents: 499,
  });
  assert.deepEqual(repeated, changed);
});

test('acepta credenciales Stripe solo en su entorno', () => {
  assert.equal(getStripeMode('sk_test_example', 'preview'), 'test');
  assert.equal(getStripeMode('sk_test_example', 'production'), undefined);
  assert.equal(getStripeMode('sk_live_example', 'production'), 'live');
  assert.equal(getStripeMode('sk_live_example', 'preview'), undefined);
  assert.equal(getStripeMode('sk_live_example', 'development'), undefined);
});

test('muestra disponibles y limita testing al entorno test configurado', () => {
  const guide = paidGuide();
  assert.equal(isGuiaVisible(guide, 'test'), true);
  assert.equal(isGuiaVisible(guide, 'live'), false);
  assert.equal(isGuiaVisible(guide, undefined), false);

  guide.status = 'available';
  assert.equal(isGuiaVisible(guide, 'test'), true);
  assert.equal(isGuiaVisible(guide, 'live'), true);
  assert.equal(isGuiaVisible(guide, undefined), true);

  guide.status = 'coming-soon';
  guide.stripe = {};
  delete guide.blobKey;
  assert.equal(isGuiaVisible(guide, undefined), false);

  guide.status = 'archived';
  assert.equal(isGuiaVisible(guide, 'test'), false);

  const free = {
    ...paidGuide(),
    status: 'free',
    amountCents: 0,
    stripe: {},
    leadMagnetUrl: '/recurso',
  };
  delete free.blobKey;
  assert.equal(isGuiaVisible(free, undefined), true);
});

test('autoriza snapshots exactos con Blobs actuales o históricos', () => {
  const guide = paidGuide();
  guide.status = 'archived';
  const previousBlobKey = guide.previousBlobKeys[0];

  assert.equal(
    authorizeGuidePurchase(guide, 'test', 'price_old12345', 'price_old12345', guide.blobKey),
    guide.blobKey,
  );
  assert.equal(
    authorizeGuidePurchase(guide, 'test', 'price_older12345', 'price_older12345', previousBlobKey),
    previousBlobKey,
  );
  assert.equal(
    authorizeGuidePurchase(guide, 'test', 'price_old12345', 'price_old12345', previousBlobKey),
    previousBlobKey,
  );
  assert.equal(authorizeGuidePurchase(guide, 'test', 'price_older12345'), guide.blobKey);

  for (const args of [
    ['price_unknown123', 'price_unknown123', guide.blobKey],
    ['price_old12345', 'price_old12345', 'arbitrario.pdf'],
    ['price_old12345', 'price_older12345', guide.blobKey],
    ['price_old12345', 'price_old12345', undefined],
    ['price_old12345', undefined, guide.blobKey],
  ]) assert.equal(authorizeGuidePurchase(guide, 'test', ...args), undefined);
});
