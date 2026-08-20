// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

const SITE_URL = 'https://pomelobaby.es';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  markdown: { syntaxHighlight: false },
  adapter: vercel(),
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "base-uri 'self'",
        "connect-src 'self' https://app.cal.com https://cal.com https://*.cal.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "frame-src https://app.cal.com https://cal.com https://*.cal.com",
        "img-src 'self' data:",
        "object-src 'none'",
        'upgrade-insecure-requests',
      ],
      scriptDirective: {
        resources: ["'self'", 'https://app.cal.com'],
        strictDynamic: true,
      },
      styleDirective: {
        resources: ["'self'", 'https://fonts.googleapis.com'],
      },
    },
  },
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