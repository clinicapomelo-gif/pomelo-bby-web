import { defineMiddleware } from 'astro:middleware';
import { CHISME_ENABLED } from './data/chisme';

const CHISME_SIGNUP_PATHS = new Set([
  '/api/chisme/confirm',
  '/api/newsletter/confirm',
  '/api/subscribe',
]);

const MAINTENANCE_BYPASS_PATHS = new Set([
  '/api/consulta-mensaje',
  '/api/guias/download',
  '/api/webhook',
  '/consulta-mensaje/enviado',
  '/consulta-mensaje/gracias',
  '/guias/gracias',
]);

// Mismas cabeceras que public/_headers: en Cloudflare ese archivo solo cubre los
// estáticos, no las respuestas del Worker (API y páginas no prerenderizadas).
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Copia con cabeceras editables: las de Response.redirect y fetch son inmutables en Workers.
const mutable = (response: Response) => new Response(response.body, response);

export const onRequest = defineMiddleware(async ({ url }, next) => {
  const response = mutable(await handle(url, next));
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(name, value);
  // Preview y *.workers.dev no deben indexarse (Vercel lo hacía solo en Preview).
  if (process.env.APP_ENV !== 'production') response.headers.set('X-Robots-Tag', 'noindex');
  return response;
});

const handle = async (url: URL, next: () => Promise<Response>) => {
  const pathname = url.pathname.replace(/\/$/, '') || '/';

  if (!CHISME_ENABLED && CHISME_SIGNUP_PATHS.has(pathname)) {
    if (pathname !== '/api/subscribe') {
      return Response.redirect(new URL('/chisme', url), 303);
    }

    return Response.json(
      { error: 'El Chisme estará disponible próximamente.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (
    process.env.MAINTENANCE_MODE !== 'true' ||
    MAINTENANCE_BYPASS_PATHS.has(pathname)
  ) return next();

  if (pathname === '/api' || pathname.startsWith('/api/')) {
    return Response.json(
      { error: 'Servicio temporalmente no disponible.' },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
          'Retry-After': '3600',
          'X-Robots-Tag': 'noindex, nofollow, noarchive',
        },
      },
    );
  }

  const response = mutable(await next());
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return response;
};
