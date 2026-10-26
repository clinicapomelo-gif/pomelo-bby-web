import { env } from 'cloudflare:workers';
import { getDownloadSource } from '../data/guide-logic.mjs';

// PDFs privados en R2 (binding GUIAS de wrangler.jsonc). Aparte de guide-delivery.ts
// porque cloudflare:workers no existe en los tests de Node.

export const isPrivateGuidePdfAvailable = async (key: string) =>
  (await env.GUIAS.head(key))?.httpMetadata?.contentType === 'application/pdf';

// Respuesta de descarga del PDF, o null si no existe o no es un PDF.
export const privatePdfResponse = async (
  key: string,
  filename: string,
  cacheControl: string,
) => {
  const pdf = await env.GUIAS.get(key);
  if (pdf?.httpMetadata?.contentType !== 'application/pdf') return null;

  return new Response(pdf.body, {
    headers: {
      'Cache-Control': cacheControl,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdf.size),
      'Content-Type': 'application/pdf',
    },
  });
};

// Una fila por descarga gratuita en Analytics Engine (binding DESCARGAS, solo en Production;
// se guarda 3 meses). Sin datos personales: guía, de dónde llega y si es un robot.
export const recordFreeDownload = (guiaId: string, request: Request) => {
  const { origen, tipo } = getDownloadSource(request.url, request.headers.get('user-agent'), request.headers.get('referer'));
  env.DESCARGAS?.writeDataPoint({ blobs: [guiaId, origen, tipo], indexes: [guiaId] });
};
