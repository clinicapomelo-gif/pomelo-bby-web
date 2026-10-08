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
export type GuiaKind = 'practical' | 'complete';
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
  pageCount?: number;
  status: GuiaStatus;
  downloadEnabled?: boolean;
  kind: GuiaKind;
  category: string;
  leadMagnetUrl?: string;
  stripe: Partial<Record<StripeMode, GuiaStripeMapping>>;
  blobKey?: string;
  previousBlobKeys?: string[];
  image?: string;
}

export type PurchasableGuia = Guia & { blobKey: string };

// Solo en la preview de Cloudflare (Stripe Sandbox), para probar compras de punta a punta.
// En Production y en local siguen apagadas; para abrir las ventas, cambiar a `true`.
export const GUIDES_ENABLED = process.env.APP_ENV === 'preview';
export const FREE_GUIDES_ENABLED = false;

export const guias = catalog as Guia[];

export const formatGuiaPrice = (price: number) =>
  price === 0 ? 'Gratis' : `${price.toFixed(2).replace('.', ',')} €`;

export const formatGuiaCategory = (category: string) =>
  category === 'alimentacion' ? 'Alimentación' : `${category.charAt(0).toUpperCase()}${category.slice(1)}`;

export const formatGuiaKind = (kind: GuiaKind) =>
  kind === 'complete' ? 'Guía completa' : 'Guía rápida';

export const getStripeMode = (
  key: string | undefined,
  appEnvironment = process.env.APP_ENV,
) => resolveStripeMode(key, appEnvironment) as StripeMode | undefined;

// Para páginas prerenderizadas: al construir en Cloudflare no hay secretos, así que el
// modo sale del entorno. Cobrar, entregar y descargar siguen validando la clave real.
export const getBuildStripeMode = (): StripeMode =>
  process.env.APP_ENV === 'production' ? 'live' : 'test';

export const getGuiaStripeMapping =(guia: Guia, mode: StripeMode) =>
  getValidStripeMapping(guia, mode) as GuiaStripeMapping | undefined;

export const getGuiaAmountCents = (guia: Guia, mode: StripeMode | undefined) =>
  selectAmountCents(guia, mode) as number;

export const getGuiaPrice = (guia: Guia, mode: StripeMode | undefined) =>
  getGuiaAmountCents(guia, mode) / 100;

export const isGuiaVisible = (guia: Guia, mode: StripeMode | undefined) =>
  checkVisibility(guia, mode) as boolean;

export const isFreeGuiaDownloadEnabled = (guia: Guia) =>
  FREE_GUIDES_ENABLED && guia.status === 'free' && guia.downloadEnabled !== false;

export const isGuiaPurchasable = (
  guia: Guia,
  mode: StripeMode | undefined,
): guia is PurchasableGuia => {
  if (!GUIDES_ENABLED || !mode || !isValidBlobKey(guia.blobKey) || !getGuiaStripeMapping(guia, mode)) return false;
  return guia.status === 'available' || (mode === 'test' && guia.status === 'testing');
};

export const authorizeGuidePurchase = (
  guia: Guia,
  mode: StripeMode,
  linePriceId: string,
  snapshotPriceId?: string,
  snapshotBlobKey?: string,
) => authorizePurchase(guia, mode, linePriceId, snapshotPriceId, snapshotBlobKey) as string | undefined;
