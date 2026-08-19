export type GuiaStatus = 'free' | 'coming-soon' | 'available';

export interface Guia {
  id: string;
  title: string;
  description: string;
  benefits?: string[];
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
    leadMagnetUrl: '/recursos/25-cosas-normales-bebes',
  },
  {
    id: 'recomendaciones-generales-recien-nacido',
    title: 'Recomendaciones generales para el recién nacido',
    description: 'Respuestas claras sobre el cordón umbilical, las regurgitaciones, la ropa, el baño y otros cuidados cotidianos del recién nacido.',
    price: 3.99,
    status: 'available',
    category: 'salud',
    stripeProductId: 'prod_V6P1cCQK6NKXQU',
    stripePriceId: 'price_1U6CDg2WVIl1hdpgTQkJSjt3',
    blobKey: 'CONSEJOS GENERALES RN.pdf',
  },
  {
    id: 'conservacion-leche-materna',
    title: 'Conservación de la leche materna',
    description: 'Una guía práctica para conservar, congelar, descongelar y transportar la leche materna de forma segura.',
    price: 3.99,
    status: 'available',
    category: 'alimentacion',
    stripeProductId: 'prod_V6P1covAOkIO5l',
    stripePriceId: 'price_1U6CDu2WVIl1hdpgzG5ztfvI',
    blobKey: 'CONSERVACIO\u0301N LECHE MATERNA.pdf',
  },
  {
    id: 'pomada-aceite-uva',
    title: 'Pomada de aceite de uva',
    description: 'Una fórmula magistral con su composición, preparación, conservación e indicaciones.',
    price: 3.99,
    status: 'available',
    category: 'salud',
    stripeProductId: 'prod_V6P2VzHsGoq52V',
    stripePriceId: 'price_1U6CEI2WVIl1hdpgZsacUjqL',
    blobKey: 'FO\u0301RMULA MAGISTRAL Pomada para grietas del pezo\u0301n.pdf',
  },
  {
    id: 'guia-definitiva-empezar-comer',
    title: 'La guía definitiva para empezar a comer',
    description: 'Alimenta a tu bebé sin miedo, sin normas imposibles y con evidencia científica.',
    price: 17.99,
    status: 'available',
    category: 'alimentacion',
    stripeProductId: 'prod_V6P2QCuXdRSTgf',
    stripePriceId: 'price_1U6CEX2WVIl1hdpg3LaIxQr4',
    blobKey: 'LA GUIA DEFINITIVA PARA EMPEZAR AC.pdf',
  },
];
