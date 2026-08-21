import { createHash } from 'node:crypto';
import {
  MAX_BLOB_KEY_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_PAID_AMOUNT_CENTS,
  MAX_SLUG_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_PAID_AMOUNT_CENTS,
  isSafeLocalUrl,
  isValidBlobKey,
  isValidPaidAmount,
  isValidPriceId,
  isValidProductId,
} from '../src/data/guide-logic.mjs';

export const GUIDE_CATEGORIES = ['alimentacion', 'sueño', 'salud', 'desarrollo', 'crianza'];
export const GUIDE_KINDS = ['practical', 'complete'];
export const GUIDE_STATUSES = ['free', 'coming-soon', 'testing', 'available', 'archived'];
export const GUIDE_BENEFITS_COUNT = 3;
export const MAX_BENEFIT_LENGTH = 200;
export const MAX_GUIDE_PAGE_COUNT = 2_000;
export {
  MAX_BLOB_KEY_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_PAID_AMOUNT_CENTS,
  MAX_SLUG_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_PAID_AMOUNT_CENTS,
};

export function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function parseEuroCents(value) {
  const normalized = String(value).trim().replace(',', '.');
  if (!/^(?:0|[1-9]\d*)\.\d{2}$/.test(normalized)) {
    throw new Error('El precio debe tener dos decimales, por ejemplo 3,99.');
  }

  const [euros, cents] = normalized.split('.');
  const amount = Number(euros) * 100 + Number(cents);
  if (!isValidPaidAmount(amount)) {
    throw new Error('El precio debe estar entre 0,50 € y 99.999,99 €.');
  }
  return amount;
}

export function validatePdfStat(stat) {
  if (!stat?.isFile?.()) throw new Error('La ruta no corresponde a un archivo.');
  if (stat.size < 5) throw new Error('El PDF está vacío o incompleto.');
}

export function validatePdf(buffer, stat) {
  validatePdfStat(stat);
  if (!Buffer.isBuffer(buffer) || buffer.length !== stat.size || buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new Error('El archivo no tiene una firma PDF válida.');
  }
}

export const pdfSha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

export const priceFingerprint = (guiaId, amountCents) => createHash('sha256')
  .update(`pomelo-bby\0${guiaId}\0eur\0${amountCents}\0one_time`)
  .digest('hex');

function assertText(value, field, minimum, maximum) {
  if (
    typeof value !== 'string' ||
    value !== value.trim() ||
    value.length < minimum ||
    value.length > maximum
  ) throw new Error(`${field} no es válido.`);
}

function validateMapping(mapping, path) {
  if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) throw new Error(`${path} no es válido.`);
  if (!isValidProductId(mapping.productId)) throw new Error(`${path}.productId no es válido.`);
  if (!isValidPriceId(mapping.priceId)) throw new Error(`${path}.priceId no es válido.`);
  if (!isValidPaidAmount(mapping.amountCents)) throw new Error(`${path}.amountCents no es válido.`);
  if (mapping.previousPriceIds !== undefined) {
    if (!Array.isArray(mapping.previousPriceIds) || mapping.previousPriceIds.some((id) => !isValidPriceId(id))) {
      throw new Error(`${path}.previousPriceIds no es válido.`);
    }
    if (new Set([mapping.priceId, ...mapping.previousPriceIds]).size !== mapping.previousPriceIds.length + 1) {
      throw new Error(`${path} contiene Price ID duplicados.`);
    }
  }
}

export function validateCatalog(catalog) {
  if (!Array.isArray(catalog)) throw new Error('El catálogo debe ser una lista.');
  const ids = new Set();

  for (const [index, guia] of catalog.entries()) {
    const path = `guías[${index}]`;
    if (!guia || typeof guia !== 'object' || Array.isArray(guia)) throw new Error(`${path} no es válido.`);
    if (
      typeof guia.id !== 'string' ||
      guia.id.length === 0 ||
      guia.id.length > MAX_SLUG_LENGTH ||
      slugify(guia.id) !== guia.id
    ) throw new Error(`${path}.id no es un slug válido.`);
    if (ids.has(guia.id)) throw new Error(`El slug ${guia.id} está duplicado.`);
    ids.add(guia.id);
    assertText(guia.title, `${path}.title`, 3, MAX_TITLE_LENGTH);
    assertText(guia.description, `${path}.description`, 10, MAX_DESCRIPTION_LENGTH);
    if (
      !Array.isArray(guia.benefits) ||
      guia.benefits.length !== GUIDE_BENEFITS_COUNT ||
      guia.benefits.some((benefit) =>
        typeof benefit !== 'string' ||
        benefit !== benefit.trim() ||
        benefit.length < 3 ||
        benefit.length > MAX_BENEFIT_LENGTH)
    ) throw new Error(`${path}.benefits debe contener tres beneficios válidos.`);
    if (!GUIDE_KINDS.includes(guia.kind)) throw new Error(`${path}.kind no es válido.`);
    if (!GUIDE_CATEGORIES.includes(guia.category)) throw new Error(`${path}.category no es válida.`);
    if (!GUIDE_STATUSES.includes(guia.status)) throw new Error(`${path}.status no es válido.`);
    if (guia.downloadEnabled !== undefined && typeof guia.downloadEnabled !== 'boolean') {
      throw new Error(`${path}.downloadEnabled no es válido.`);
    }
    if (!Number.isSafeInteger(guia.pageCount) || guia.pageCount < 1 || guia.pageCount > MAX_GUIDE_PAGE_COUNT) {
      throw new Error(`${path}.pageCount no es válido.`);
    }
    if (!Number.isSafeInteger(guia.amountCents) || guia.amountCents < 0 || guia.amountCents > MAX_PAID_AMOUNT_CENTS) {
      throw new Error(`${path}.amountCents no es válido.`);
    }
    if (!guia.stripe || typeof guia.stripe !== 'object' || Array.isArray(guia.stripe)) throw new Error(`${path}.stripe no es válido.`);
    if (Object.keys(guia.stripe).some((mode) => !['test', 'live'].includes(mode))) throw new Error(`${path}.stripe contiene un modo desconocido.`);
    for (const mode of ['test', 'live']) if (guia.stripe[mode] !== undefined) validateMapping(guia.stripe[mode], `${path}.stripe.${mode}`);

    if (guia.leadMagnetUrl !== undefined && !isSafeLocalUrl(guia.leadMagnetUrl)) {
      throw new Error(`${path}.leadMagnetUrl no es una ruta local segura.`);
    }
    if (guia.status === 'free') {
      if (guia.amountCents !== 0 || !isSafeLocalUrl(guia.leadMagnetUrl)) {
        throw new Error(`${path} gratuito necesita importe cero y leadMagnetUrl local.`);
      }
    } else if (!isValidPaidAmount(guia.amountCents)) {
      throw new Error(`${path} necesita un importe entre 0,50 € y 99.999,99 €.`);
    }

    if (guia.blobKey !== undefined && !isValidBlobKey(guia.blobKey)) throw new Error(`${path}.blobKey no es válido.`);
    if (['testing', 'available', 'archived'].includes(guia.status) && !isValidBlobKey(guia.blobKey)) {
      throw new Error(`${path} necesita blobKey.`);
    }
    if (guia.status === 'testing' && !guia.stripe.test) throw new Error(`${path} en testing necesita configuración Stripe test.`);
    if (['available', 'archived'].includes(guia.status) && !guia.stripe.test && !guia.stripe.live) {
      throw new Error(`${path} disponible o archivado necesita configuración Stripe para compras históricas.`);
    }
  }

  return catalog;
}

const sameCopy = (existing, guide) =>
  existing.title === guide.title &&
  existing.description === guide.description &&
  existing.kind === guide.kind &&
  existing.pageCount === guide.pageCount &&
  existing.category === guide.category &&
  JSON.stringify(existing.benefits) === JSON.stringify(guide.benefits);

export function assertProvisionAllowed(existing, guide, amountCents) {
  if (!existing) return;
  if (existing.status === 'free' || existing.status === 'archived') {
    throw new Error('No se puede provisionar una guía gratuita o archivada.');
  }
  if (!sameCopy(existing, guide)) throw new Error('El slug ya pertenece a otra ficha. Para cambiar el copy, edita el catálogo por separado.');

  if (existing.status === 'coming-soon') {
    if (
      existing.amountCents !== amountCents ||
      existing.blobKey ||
      existing.stripe.test ||
      existing.stripe.live
    ) throw new Error('La guía coming-soon no se puede activar automáticamente de forma segura.');
    return;
  }

  const test = existing.stripe.test;
  if (
    !test ||
    test.amountCents !== amountCents ||
    guide.blobKey !== existing.blobKey
  ) throw new Error('La guía existente solo admite una repetición exacta. Usa guide:price para cambiar el precio.');
}

export function upsertTestGuide(catalog, guide, mapping) {
  validateCatalog(catalog);
  const next = structuredClone(catalog);
  const index = next.findIndex((item) => item.id === guide.id);
  const previous = index >= 0 ? next[index] : undefined;
  assertProvisionAllowed(previous, guide, mapping.amountCents);

  if (previous?.status === 'testing' || previous?.status === 'available') {
    const test = previous.stripe.test;
    if (
      test.productId !== mapping.productId ||
      test.priceId !== mapping.priceId ||
      test.amountCents !== mapping.amountCents
    ) throw new Error('La guía existente solo admite una repetición exacta. Usa guide:price para cambiar el precio.');
    return next;
  }

  const entry = {
    ...previous,
    ...guide,
    amountCents: mapping.amountCents,
    status: 'testing',
    stripe: {
      ...(previous?.stripe ?? {}),
      test: {
        productId: mapping.productId,
        priceId: mapping.priceId,
        amountCents: mapping.amountCents,
      },
    },
  };
  if (index >= 0) next[index] = entry;
  else next.push(entry);
  return validateCatalog(next);
}

export function updateTestPrice(catalog, guiaId, mapping) {
  validateCatalog(catalog);
  const next = structuredClone(catalog);
  const guide = next.find((item) => item.id === guiaId);
  if (!guide?.stripe?.test || !['testing', 'available'].includes(guide.status)) {
    throw new Error('La guía no admite cambios de precio test.');
  }
  if (guide.stripe.test.productId !== mapping.productId) throw new Error('El Product no coincide con el catálogo.');
  const oldIds = [guide.stripe.test.priceId, ...(guide.stripe.test.previousPriceIds ?? [])]
    .filter((id) => id !== mapping.priceId);
  guide.amountCents = mapping.amountCents;
  guide.stripe.test = {
    productId: mapping.productId,
    priceId: mapping.priceId,
    amountCents: mapping.amountCents,
    ...(oldIds.length ? { previousPriceIds: [...new Set(oldIds)] } : {}),
  };
  return validateCatalog(next);
}
