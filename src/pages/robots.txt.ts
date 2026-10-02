import type { APIRoute } from 'astro';
import { getSiteUrl } from '../lib/site-url';

export const prerender = false;

export const GET: APIRoute = ({ request }) => {
  // Fuera de Production (preview, local) no se rastrea: las páginas estáticas no pasan
  // por el middleware y no llevan X-Robots-Tag.
  const blocked = process.env.MAINTENANCE_MODE === 'true' || process.env.APP_ENV !== 'production';
  const content = blocked
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', getSiteUrl(request)).href}\n`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
};
