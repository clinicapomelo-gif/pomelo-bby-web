// Catálogo de guías/PDFs de pomelo.bby
// Para añadir un producto:
// 1. Añade una entrada aquí con su stripeProductId y stripePriceId
// 2. Crea el producto en el panel de Stripe (https://dashboard.stripe.com/products)
// 3. Sube el PDF a Vercel Blob y actualiza el campo `blobKey`

export interface Guia {
  id: string;               // slug único (usado en la URL)
  title: string;
  description: string;      // descripción corta (para la tarjeta)
  longDescription: string;  // descripción larga (para la página de producto)
  price: number;            // precio en euros
  stripeProductId: string;  // ID del producto en Stripe (prod_xxx)
  stripePriceId: string;    // ID del precio en Stripe (price_xxx)
  blobKey: string;          // nombre del archivo en Vercel Blob
  category: string;
  includes: string[];       // qué incluye la guía (lista de puntos)
  image?: string;           // imagen de portada (opcional)
}

export const guias: Guia[] = [
  {
    id: 'guia-introduccion-solidos',
    title: 'Guía de introducción a los sólidos',
    description: 'Todo lo que necesitas saber para empezar la alimentación complementaria con seguridad y sin estrés.',
    longDescription: 'La introducción a los sólidos es uno de los momentos que más dudas genera en las familias. Esta guía te explica cuándo empezar, qué alimentos introducir primero, qué evitar y cómo hacerlo tanto con purés como con BLW.',
    price: 9.99,
    stripeProductId: 'prod_PLACEHOLDER',
    stripePriceId: 'price_PLACEHOLDER',
    blobKey: 'guia-introduccion-solidos.pdf',
    category: 'alimentacion',
    includes: [
      'Cuándo y cómo empezar',
      'Alimentos recomendados y a evitar',
      'Guía de texturas por edad',
      'Diferencias entre purés y BLW',
      'Tabla de raciones orientativas',
    ],
  },
  {
    id: 'guia-sueno-bebe',
    title: 'Guía de sueño del bebé',
    description: 'Entiende el sueño de tu bebé y encuentra estrategias reales para que toda la familia descanse mejor.',
    longDescription: 'El sueño es uno de los temas que más preocupa a las familias con bebés. Esta guía te explica cómo funciona el sueño infantil, qué es normal en cada etapa y qué puedes hacer para acompañar a tu bebé sin agotarte.',
    price: 9.99,
    stripeProductId: 'prod_PLACEHOLDER',
    stripePriceId: 'price_PLACEHOLDER',
    blobKey: 'guia-sueno-bebe.pdf',
    category: 'sueño',
    includes: [
      'Cómo funciona el sueño infantil',
      'Qué es normal en cada etapa',
      'Estrategias para mejorar el descanso',
      'Colecho seguro',
      'Cuándo pedir ayuda profesional',
    ],
  },
];
