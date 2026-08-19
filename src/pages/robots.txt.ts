import type { APIRoute } from 'astro';
import { getSiteUrl } from '../lib/site-url';

export const prerender = false;

export const GET: APIRoute = ({ request }) => {
  const maintenanceMode = import.meta.env.MAINTENANCE_MODE === 'true';
  const content = maintenanceMode
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', getSiteUrl(request)).href}\n`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
};
