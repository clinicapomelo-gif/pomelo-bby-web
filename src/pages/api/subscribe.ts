import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LEAD_MAGNET_ID = '25-cosas-normales-bebes';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

const jsonResponse = (body: object, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

const getString = (value: unknown) => typeof value === 'string' ? value : undefined;

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

export const POST: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin');
  if (origin) {
    const allowedOrigins = new Set([new URL(request.url).origin]);
    const siteUrl = import.meta.env.SITE_URL;

    if (siteUrl) {
      try {
        allowedOrigins.add(new URL(siteUrl).origin);
      } catch {
        // Una URL mal configurada no debe ampliar los orígenes permitidos.
      }
    }

    if (!allowedOrigins.has(origin)) {
      return jsonResponse({ error: 'Origen no permitido.' }, 403);
    }
  }

  const contentType = request.headers.get('content-type') || '';
  const expectsJson = contentType.includes('application/json');

  let email: string | undefined;
  let nombre: string | undefined;
  let honeypot: string | undefined;
  let privacy: string | undefined;
  let recurso: string | undefined;

  try {
    if (expectsJson) {
      const body: unknown = await request.json();
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
      const values = body as Record<string, unknown>;
      email = getString(values.email);
      nombre = getString(values.nombre);
      honeypot = getString(values.website);
      privacy = getString(values.privacy);
      recurso = getString(values.recurso);
    } else {
      const formData = await request.formData();
      email = getString(formData.get('email'));
      nombre = getString(formData.get('nombre'));
      honeypot = getString(formData.get('website'));
      privacy = getString(formData.get('privacy'));
      recurso = getString(formData.get('recurso'));
    }
  } catch {
    return jsonResponse({ error: 'Datos mal formados.' }, 400);
  }

  const isLeadMagnet = recurso === LEAD_MAGNET_ID;
  const successUrl = isLeadMagnet
    ? '/recursos/25-cosas-normales-bebes/gracias'
    : '/newsletter/gracias';

  if (honeypot) {
    return expectsJson
      ? jsonResponse({ success: true })
      : Response.redirect(new URL(successUrl, request.url), 303);
  }

  if (recurso && !isLeadMagnet) {
    return jsonResponse({ error: 'Recurso no válido.' }, 400);
  }

  const cleanEmail = email?.trim().toLowerCase();
  if (!cleanEmail) {
    const error = isLeadMagnet
      ? 'Escribe tu correo para que pueda enviarte la guía.'
      : 'Escribe tu correo para apuntarte a El Chisme de Mar.';
    return jsonResponse({ error }, 400);
  }

  if (cleanEmail.length > 254 || !EMAIL_REGEX.test(cleanEmail)) {
    return jsonResponse({ error: 'Revisa el correo. Debe tener un formato como nombre@correo.com.' }, 400);
  }

  if (!privacy || !['on', 'true', '1'].includes(privacy)) {
    const error = isLeadMagnet
      ? 'Necesito que aceptes la política de privacidad para enviarte la guía.'
      : 'Necesito que aceptes la política de privacidad para completar la suscripción.';
    return jsonResponse({ error }, 400);
  }

  const resendKey = import.meta.env.RESEND_API_KEY;
  const audienceId = import.meta.env.RESEND_AUDIENCE_ID;
  if (!resendKey || !audienceId) {
    return jsonResponse({ error: 'Ahora mismo no he podido guardar tu suscripción. Inténtalo de nuevo en unos minutos.' }, 503);
  }

  let downloadUrl: URL | undefined;
  let sender: string | undefined;

  if (isLeadMagnet) {
    sender = import.meta.env.RESEND_FROM_EMAIL?.trim();
    const configuredDownloadUrl = import.meta.env.LEAD_MAGNET_25_COSAS_URL?.trim();

    try {
      downloadUrl = configuredDownloadUrl ? new URL(configuredDownloadUrl) : undefined;
      if (!downloadUrl || !['http:', 'https:'].includes(downloadUrl.protocol)) throw new Error();
    } catch {
      return jsonResponse({ error: 'La guía todavía no está disponible. Inténtalo de nuevo más tarde.' }, 503);
    }

    if (!sender) {
      return jsonResponse({ error: 'El envío de la guía no está disponible ahora mismo.' }, 503);
    }
  }

  const resend = new Resend(resendKey);
  const cleanNombre = nombre?.trim().slice(0, 100) || undefined;

  try {
    let contactError = (await resend.contacts.update({
      email: cleanEmail,
      firstName: cleanNombre,
      unsubscribed: false,
      audienceId,
    })).error;

    if (contactError?.name === 'not_found') {
      contactError = (await resend.contacts.create({
        email: cleanEmail,
        firstName: cleanNombre,
        unsubscribed: false,
        audienceId,
      })).error;
    }

    if (contactError) {
      console.error('Resend contact operation failed', contactError.name, contactError.statusCode);
      return jsonResponse({ error: 'No se pudo completar la suscripción. Inténtalo de nuevo.' }, 502);
    }

    if (isLeadMagnet && downloadUrl && sender) {
      const safeDownloadUrl = escapeHtml(downloadUrl.href);
      const greeting = cleanNombre ? `Hola, ${escapeHtml(cleanNombre)}.` : 'Hola.';
      const emailResult = await resend.emails.send({
        from: sender,
        to: cleanEmail,
        subject: 'Aquí tienes tu guía: 25 cosas normales en los bebés',
        text: `${cleanNombre ? `Hola, ${cleanNombre}.` : 'Hola.'}\n\nGracias por confiar en pomelo.bby. Aquí tienes «25 cosas normales en los bebés»:\n${downloadUrl.href}\n\nAl pedir la guía también te has unido a El Chisme de Mar. Cada dos semanas te escribiré con historias reales, respuestas tranquilas y acompañamiento sin ruido.\n\nEn cada email encontrarás la opción para darte de baja cuando quieras.\n\nEste recurso es informativo y no sustituye la valoración de un profesional sanitario.`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #2d2d2d; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            <h1 style="font-size: 24px;">Aquí tienes tu guía</h1>
            <p>${greeting}</p>
            <p>Gracias por confiar en pomelo.bby.</p>
            <p>He preparado <strong>25 cosas normales en los bebés</strong> para ayudarte a entender, con calma y en palabras sencillas, algunas situaciones habituales.</p>
            <p style="margin: 28px 0;">
              <a href="${safeDownloadUrl}" style="background: #ee9496; border-radius: 8px; color: #ffffff; display: inline-block; font-weight: bold; padding: 12px 20px; text-decoration: none;">Descargar la guía gratis</a>
            </p>
            <p>Si el botón no funciona, puedes abrir este enlace:</p>
            <p><a href="${safeDownloadUrl}">${safeDownloadUrl}</a></p>
            <p>Al pedir la guía también te has unido a <strong>El Chisme de Mar</strong>. Cada dos semanas te escribiré con historias reales, respuestas tranquilas y acompañamiento sin ruido.</p>
            <p>En cada email encontrarás la opción para darte de baja cuando quieras.</p>
            <p style="font-size: 13px; color: #5a5a5a; margin-top: 28px;">Este recurso es informativo y no sustituye la valoración de un profesional sanitario.</p>
          </div>
        `,
      });

      if (emailResult.error) {
        console.error('Resend lead magnet email failed', emailResult.error.name, emailResult.error.statusCode);
        return jsonResponse({ error: 'No se pudo enviar la guía. Inténtalo de nuevo.' }, 502);
      }
    }

    return expectsJson
      ? jsonResponse({ success: true })
      : Response.redirect(new URL(successUrl, request.url), 303);
  } catch {
    console.error('Resend subscription request failed');
    return jsonResponse({ error: 'No se pudo completar la solicitud. Inténtalo de nuevo.' }, 502);
  }
};
