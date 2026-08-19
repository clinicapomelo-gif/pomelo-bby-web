import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ url }, next) => {
  if (import.meta.env.MAINTENANCE_MODE !== 'true') return next();

  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
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
