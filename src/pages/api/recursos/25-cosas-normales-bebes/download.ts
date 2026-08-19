import type { APIRoute } from 'astro';
import { get, list } from '@vercel/blob';

export const prerender = false;

const BLOB_PREFIX = '25 cosas normales en ';

const unavailable = () => new Response('La guía no está disponible temporalmente.', {
  status: 503,
  headers: {
    'Cache-Control': 'private, no-store',
    'Content-Type': 'text/plain; charset=utf-8',
  },
});

export const GET: APIRoute = async () => {
  const auth = {
    oidcToken: import.meta.env.VERCEL_OIDC_TOKEN,
    storeId: import.meta.env.BLOB_STORE_ID,
  };

  try {
    const { blobs: [pdf] } = await list({ ...auth, limit: 1, prefix: BLOB_PREFIX });
    if (!pdf) return unavailable();

    const result = await get(pdf.url, { ...auth, access: 'private' });

    if (!result || result.statusCode !== 200 || result.blob.contentType !== 'application/pdf') {
      return unavailable();
    }

    return new Response(result.stream, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Disposition': 'attachment; filename="25-cosas-normales-bebes.pdf"',
        'Content-Length': String(result.blob.size),
        'Content-Type': 'application/pdf',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Lead magnet Blob download error:', error instanceof Error ? error.message : 'Unknown error');
    return unavailable();
  }
};
