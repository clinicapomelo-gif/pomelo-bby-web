// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

const SITE_URL = 'https://pomelobaby.es';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  adapter: vercel(),
  integrations: [
    sitemap({
      // Excluir páginas legales y de utilidad del sitemap
      filter: (page) =>
        !page.includes('/aviso-legal') &&
        !page.includes('/proteccion-datos') &&
        !page.includes('/cookies') &&
        !page.includes('/condiciones-venta') &&
        !page.includes('/gracias') &&
        !page.includes('/newsletter') &&
        !page.includes('/chisme/confirm'),
    }),
  ],
});