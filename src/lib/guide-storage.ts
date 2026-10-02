import { env } from 'cloudflare:workers';

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
