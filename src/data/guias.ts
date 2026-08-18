export type GuiaStatus = 'free' | 'coming-soon' | 'available';

export interface Guia {
  id: string;
  title: string;
  description: string;
  price: number;
  status: GuiaStatus;
  category: string;
  leadMagnetUrl?: string;
  stripeProductId?: string;
  stripePriceId?: string;
  blobKey?: string;
  image?: string;
}

export const formatGuiaPrice = (price: number) =>
  price === 0 ? 'Gratis' : `${price.toFixed(2).replace('.', ',')} €`;

export const isGuiaPurchasable = (guia: Guia): guia is Guia & { stripePriceId: string; blobKey: string } =>
  guia.status === 'available' &&
  Boolean(guia.blobKey) &&
  Boolean(guia.stripePriceId?.startsWith('price_')) &&
  !guia.stripePriceId?.includes('PLACEHOLDER');

export const guias: Guia[] = [
  {
    id: '25-cosas-normales-bebes',
    title: '25 cosas normales en los bebés',
    description: 'Una guía breve para entender mejor algunas cosas habituales en los bebés.',
    price: 0,
    status: 'free',
    category: 'salud',
    leadMagnetUrl: '/newsletter?recurso=25-cosas-normales-bebes',
  },
  {
    id: 'sueno-infantil-palabras-normales',
    title: 'El sueño infantil explicado en palabras normales',
    description: 'Una explicación clara y cercana sobre el sueño infantil.',
    price: 14.9,
    status: 'coming-soon',
    category: 'sueño',
  },
  {
    id: 'guia-rabietas',
    title: 'La guía de las rabietas',
    description: 'Una guía práctica para acompañar las rabietas.',
    price: 14.9,
    status: 'coming-soon',
    category: 'crianza',
  },
  {
    id: 'retirada-panal-sin-dramas',
    title: 'Retirada del pañal sin dramas',
    description: 'Una guía práctica para acompañar la retirada del pañal.',
    price: 12.9,
    status: 'coming-soon',
    category: 'desarrollo',
  },
  {
    id: 'destete-sin-culpa',
    title: 'Destete sin culpa',
    description: 'Una guía para acompañar el destete sin culpa.',
    price: 12.9,
    status: 'coming-soon',
    category: 'alimentacion',
  },
  {
    id: 'alimentacion-complementaria-familias-reales',
    title: 'Alimentación complementaria para familias reales',
    description: 'Una guía clara sobre alimentación complementaria para el día a día.',
    price: 14.9,
    status: 'coming-soon',
    category: 'alimentacion',
  },
];
