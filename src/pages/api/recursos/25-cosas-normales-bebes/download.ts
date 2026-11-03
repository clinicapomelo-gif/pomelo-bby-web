import type { APIRoute } from 'astro';
import { privatePdfResponse, recordFreeDownload } from '../../../../lib/guide-storage';

export const prerender = false;

// Clave exacta en R2: listar por prefijo costaría una operación de escritura (clase A) por descarga.
const PDF_KEY = 'recursos/25-cosas-normales-bebes.pdf';

const unavailable = () => new Response('La guía no está disponible temporalmente.', {
  status: 503,
  headers: {
    'Cache-Control': 'private, no-store',
    'Content-Type': 'text/plain; charset=utf-8',
  },
});

export const GET: APIRoute = async ({ request }) => {
  try {
    const response = await privatePdfResponse(PDF_KEY, '25-cosas-normales-bebes.pdf', 'no-store');
    if (!response) return unavailable();
    recordFreeDownload('25-cosas-normales-bebes', request);
    return response;
  } catch (error) {
    console.error('Lead magnet PDF download error:', error instanceof Error ? error.name : 'UnknownError');
    return unavailable();
  }
};
