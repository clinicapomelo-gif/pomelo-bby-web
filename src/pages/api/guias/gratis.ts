import type { APIRoute } from 'astro';
import { guias, isFreeGuiaDownloadEnabled } from '../../../data/guias';
import { privatePdfResponse, recordFreeDownload } from '../../../lib/guide-storage';

export const prerender = false;

const unavailable = () => new Response('La guía no está disponible temporalmente.', {
  status: 404,
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
});

export const GET: APIRoute = async ({ url, request }) => {
  const guia = guias.find(({ id }) => id === url.searchParams.get('id'));

  if (!guia?.blobKey || !isFreeGuiaDownloadEnabled(guia)) return unavailable();

  try {
    const response = await privatePdfResponse(guia.blobKey, `${guia.id}.pdf`, 'public, max-age=3600');
    if (!response) return unavailable();
    recordFreeDownload(guia.id, request);
    return response;
  } catch (error: unknown) {
    console.error('Free guide download error:', error instanceof Error ? error.name : 'UnknownError');
    return unavailable();
  }
};
