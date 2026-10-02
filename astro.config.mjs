// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

const SITE_URL = 'https://pomelobaby.es';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  redirects: {
    '/tienda': '/guias',
    '/tienda/gracias': '/guias/gracias',
    '/tienda/[id]': '/guias/[id]',
  },
  markdown: { syntaxHighlight: false },
  // Sin sesiones ni astro:assets: evita los bindings KV (SESSION) e Images.
  adapter: cloudflare({ imageService: 'passthrough' }),
  session: false,
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "base-uri 'self'",
        "connect-src 'self' https://app.cal.com https://cal.com https://*.cal.com https://cloudflareinsights.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "frame-src https://app.cal.com https://cal.com https://*.cal.com",
        "img-src 'self' data:",
        "object-src 'none'",
        'upgrade-insecure-requests',
      ],
      scriptDirective: {
        resources: ["'self'", 'https://app.cal.com', 'https://static.cloudflareinsights.com'],
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
        !page.includes('/consulta-mensaje/enviado') &&
        !page.includes('/links') &&
        !page.includes('/newsletter') &&
        !page.includes('/chisme/confirm'),
    }),
  ],
});