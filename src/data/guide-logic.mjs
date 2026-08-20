export const MIN_PAID_AMOUNT_CENTS = 50;
export const MAX_PAID_AMOUNT_CENTS = 9_999_999;
export const MAX_SLUG_LENGTH = 100;
export const MAX_TITLE_LENGTH = 160;
export const MAX_DESCRIPTION_LENGTH = 2_000;
export const MAX_BLOB_KEY_LENGTH = 500;
export const MAX_LOCAL_URL_LENGTH = 500;

const PRODUCT_ID = /^prod_[A-Za-z0-9]{8,250}$/;
const PRICE_ID = /^price_[A-Za-z0-9]{8,249}$/;

export const isValidProductId = (value) =>
  typeof value === 'string' && PRODUCT_ID.test(value) && !value.toUpperCase().includes('PLACEHOLDER');

export const isValidPriceId = (value) =>
  typeof value === 'string' && PRICE_ID.test(value) && !value.toUpperCase().includes('PLACEHOLDER');

export const isValidPaidAmount = (value) =>
  Number.isSafeInteger(value) && value >= MIN_PAID_AMOUNT_CENTS && value <= MAX_PAID_AMOUNT_CENTS;

export const isValidBlobKey = (value) =>
  typeof value === 'string' &&
  value === value.trim() &&
  value.length > 0 &&
  value.length <= MAX_BLOB_KEY_LENGTH &&
  !value.startsWith('/') &&
  !value.includes('://') &&
  !value.includes('\\') &&
  !/[\u0000-\u001f\u007f]/.test(value);

export function isSafeLocalUrl(value) {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > MAX_LOCAL_URL_LENGTH ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) return false;

  try {
    return new URL(value, 'https://pomelo.invalid').origin === 'https://pomelo.invalid';
  } catch {
    return false;
  }
}

export const isValidStripeMapping = (mapping) => {
  if (
    !mapping ||
    typeof mapping !== 'object' ||
    Array.isArray(mapping) ||
    !isValidProductId(mapping.productId) ||
    !isValidPriceId(mapping.priceId) ||
    !isValidPaidAmount(mapping.amountCents)
  ) return false;
  if (mapping.previousPriceIds === undefined) return true;
  return Array.isArray(mapping.previousPriceIds) &&
    mapping.previousPriceIds.every(isValidPriceId) &&
    new Set([mapping.priceId, ...mapping.previousPriceIds]).size === mapping.previousPriceIds.length + 1;
};

export const getStripeMode = (key, vercelEnvironment) => {
  if (typeof key !== 'string' || key.toUpperCase().includes('PLACEHOLDER')) return undefined;
  if (key.startsWith('sk_test_') || key.startsWith('rk_test_')) {
    return vercelEnvironment === 'production' ? undefined : 'test';
  }
  if (key.startsWith('sk_live_') || key.startsWith('rk_live_')) return 'live';
  return undefined;
};

export const getValidStripeMapping = (guia, mode) => {
  const mapping = mode && guia?.stripe?.[mode];
  return isValidStripeMapping(mapping) ? mapping : undefined;
};

export const getGuiaAmountCents = (guia, mode) =>
  getValidStripeMapping(guia, mode)?.amountCents ?? guia.amountCents;

export const isGuiaVisible = (guia, mode) => {
  if (guia.status === 'free' || guia.status === 'available') return true;
  return guia.status === 'testing' && mode === 'test' && Boolean(getValidStripeMapping(guia, mode));
};

export const getKnownPriceIds = (guia, mode) => {
  const mapping = getValidStripeMapping(guia, mode);
  if (!mapping) return [];
  return [mapping.priceId, ...(mapping.previousPriceIds ?? []).filter(isValidPriceId)];
};

export function authorizeGuidePurchase(guia, mode, linePriceId, snapshotPriceId, snapshotBlobKey) {
  if (!getKnownPriceIds(guia, mode).includes(linePriceId) || !isValidBlobKey(guia.blobKey)) return undefined;

  const hasSnapshot = Boolean(snapshotPriceId || snapshotBlobKey);
  if (hasSnapshot && (linePriceId !== snapshotPriceId || snapshotBlobKey !== guia.blobKey)) return undefined;

  return guia.blobKey;
}
