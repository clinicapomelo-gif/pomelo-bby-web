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

export const onRequest = defineMiddleware(async ({ url }, next) => {
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

  const response = await next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return response;
});
