import type { APIRoute } from 'astro';
import { get } from '@vercel/blob';
import { guias, isFreeGuiaDownloadEnabled } from '../../../data/guias';

export const prerender = false;

const unavailable = () => new Response('La guía no está disponible temporalmente.', {
  status: 404,
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
});

export const GET: APIRoute = async ({ url }) => {
  const guia = guias.find(({ id }) => id === url.searchParams.get('id'));

  if (!guia?.blobKey || !isFreeGuiaDownloadEnabled(guia)) return unavailable();

  try {
    const result = await get(guia.blobKey, { access: 'private' });
    if (!result || result.statusCode !== 200 || result.blob.contentType !== 'application/pdf') {
      return unavailable();
    }

    return new Response(result.stream, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': `attachment; filename="${guia.id}.pdf"`,
        'Content-Length': String(result.blob.size),
        'Content-Type': 'application/pdf',
      },
    });
  } catch (error: unknown) {
    console.error('Free guide download error:', error instanceof Error ? error.name : 'UnknownError');
    return unavailable();
  }
};
