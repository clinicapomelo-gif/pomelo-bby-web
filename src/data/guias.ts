import catalog from './guias.json';
import {
  authorizeGuidePurchase as authorizePurchase,
  getGuiaAmountCents as selectAmountCents,
  getStripeMode as resolveStripeMode,
  getValidStripeMapping,
  isGuiaVisible as checkVisibility,
  isValidBlobKey,
} from './guide-logic.mjs';

export type GuiaStatus = 'free' | 'coming-soon' | 'testing' | 'available' | 'archived';
export type StripeMode = 'test' | 'live';

export interface GuiaStripeMapping {
  productId: string;
  priceId: string;
  amountCents: number;
  previousPriceIds?: string[];
}

export interface Guia {
  id: string;
  title: string;
  description: string;
  benefits?: string[];
  amountCents: number;
  status: GuiaStatus;
  category: string;
  leadMagnetUrl?: string;
  stripe: Partial<Record<StripeMode, GuiaStripeMapping>>;
  blobKey?: string;
  image?: string;
}

export type PurchasableGuia = Guia & { blobKey: string };

export const guias = catalog as Guia[];

export const formatGuiaPrice = (price: number) =>
  price === 0 ? 'Gratis' : `${price.toFixed(2).replace('.', ',')} €`;

export const formatGuiaCategory = (category: string) =>
  category === 'alimentacion' ? 'Alimentación' : `${category.charAt(0).toUpperCase()}${category.slice(1)}`;

export const getStripeMode = (
  key: string | undefined,
  vercelEnvironment = process.env.VERCEL_ENV,
) => resolveStripeMode(key, vercelEnvironment) as StripeMode | undefined;

export const getGuiaStripeMapping = (guia: Guia, mode: StripeMode) =>
  getValidStripeMapping(guia, mode) as GuiaStripeMapping | undefined;

export const getGuiaAmountCents = (guia: Guia, mode: StripeMode | undefined) =>
  selectAmountCents(guia, mode) as number;

export const getGuiaPrice = (guia: Guia, mode: StripeMode | undefined) =>
  getGuiaAmountCents(guia, mode) / 100;

export const isGuiaVisible = (guia: Guia, mode: StripeMode | undefined) =>
  checkVisibility(guia, mode) as boolean;

export const isGuiaPurchasable = (
  guia: Guia,
  mode: StripeMode | undefined,
): guia is PurchasableGuia => {
  if (!mode || !isValidBlobKey(guia.blobKey) || !getGuiaStripeMapping(guia, mode)) return false;
  return guia.status === 'available' || (mode === 'test' && guia.status === 'testing');
};

export const authorizeGuidePurchase = (
  guia: Guia,
  mode: StripeMode,
  linePriceId: string,
  snapshotPriceId?: string,
  snapshotBlobKey?: string,
) => authorizePurchase(guia, mode, linePriceId, snapshotPriceId, snapshotBlobKey) as string | undefined;
