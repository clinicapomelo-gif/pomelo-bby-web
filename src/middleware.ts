import { defineMiddleware } from 'astro:middleware';

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
  if (
    import.meta.env.MAINTENANCE_MODE !== 'true' ||
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
