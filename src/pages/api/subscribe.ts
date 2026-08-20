import { createHmac } from 'node:crypto';
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { encryptNewsletterConfirmation } from '../../lib/newsletter-confirmation';
import { getSiteUrl } from '../../lib/site-url';

export const prerender = false;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LEAD_MAGNET_ID = '25-cosas-normales-bebes';
const CONSENT_VERSION = 'newsletter_v1';
const CONFIRMATION_TTL_MS = 48 * 60 * 60 * 1000;
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
    : '/chisme/gracias';

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
    return jsonResponse({
      error: isLeadMagnet
        ? 'Escribe tu correo para que pueda enviarte la guía.'
        : 'Escribe tu correo para apuntarte a El Chisme de Mar.',
    }, 400);
  }

  if (cleanEmail.length > 254 || !EMAIL_REGEX.test(cleanEmail)) {
    return jsonResponse({ error: 'Revisa el correo. Debe tener un formato como nombre@correo.com.' }, 400);
  }

  const cleanNombre = nombre?.trim();
  if (!cleanNombre || cleanNombre.length > 100) {
    return jsonResponse({ error: 'Escribe un nombre válido para personalizar tus correos.' }, 400);
  }

  if (!privacy || !['on', 'true', '1'].includes(privacy)) {
    return jsonResponse({
      error: isLeadMagnet
        ? 'Necesito que aceptes la política de privacidad para enviarte la guía.'
        : 'Necesito que aceptes la política de privacidad para completar la suscripción.',
    }, 400);
  }

  const resendKey = import.meta.env.RESEND_API_KEY;
  const sender = import.meta.env.RESEND_FROM_EMAIL?.trim();
  const confirmationSecret = import.meta.env.NEWSLETTER_CONFIRMATION_SECRET;
  if (
    !resendKey || !sender || !confirmationSecret ||
    !import.meta.env.RESEND_NEWSLETTER_SEGMENT_ID ||
    !import.meta.env.RESEND_NEWSLETTER_TOPIC_ID
  ) {
    return jsonResponse({ error: 'Ahora mismo no he podido iniciar la suscripción. Inténtalo de nuevo en unos minutos.' }, 503);
  }

  const consentedAt = new Date().toISOString();
  let confirmationUrl: URL;

  try {
    const token = encryptNewsletterConfirmation({
      email: cleanEmail,
      name: cleanNombre,
      source: isLeadMagnet ? 'lead_magnet_25_cosas' : 'newsletter',
      consentVersion: CONSENT_VERSION,
      consentedAt,
      expiresAt: Date.now() + CONFIRMATION_TTL_MS,
    }, confirmationSecret);

    confirmationUrl = new URL('/chisme/confirm', getSiteUrl(request));
    confirmationUrl.searchParams.set('token', token);
  } catch (error) {
    console.error('Newsletter confirmation token error:', error instanceof Error ? error.name : 'UnknownError');
    return jsonResponse({ error: 'Ahora mismo no he podido iniciar la suscripción. Inténtalo de nuevo en unos minutos.' }, 503);
  }

  const safeUrl = escapeHtml(confirmationUrl.href);
  const greeting = `Hola, ${escapeHtml(cleanNombre)}.`;
  const action = isLeadMagnet ? 'Confirmar y descargar la guía' : 'Confirmar mi suscripción';
  const subject = isLeadMagnet
    ? 'Confirma tu correo y descarga la guía'
    : 'Confirma tu suscripción a El Chisme de Mar';

  const confirmationWindow = Math.floor(Date.now() / (60 * 60 * 1000));
  const idempotencyKey = createHmac('sha256', confirmationSecret)
    .update(`${cleanEmail}:${isLeadMagnet ? LEAD_MAGNET_ID : 'newsletter'}:${confirmationWindow}:${token}`)
    .digest('hex');

  try {
    const result = await new Resend(resendKey).emails.send({
      from: sender,
      to: cleanEmail,
      subject,
      text: `Hola, ${cleanNombre}.\n\nConfirma tu correo para ${isLeadMagnet ? 'descargar «25 cosas normales en los bebés» y unirte' : 'unirte'} a El Chisme de Mar:\n${confirmationUrl.href}\n\nEl enlace caduca en 48 horas. Si no has solicitado este email, puedes ignorarlo.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #2d2d2d; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h1 style="font-size: 24px;">Confirma tu correo</h1>
          <p>${greeting}</p>
          <p>${isLeadMagnet ? 'Confirma tu dirección para descargar <strong>25 cosas normales en los bebés</strong> y unirte a El Chisme de Mar.' : 'Solo falta confirmar tu dirección para unirte a El Chisme de Mar.'}</p>
          <p style="margin: 28px 0;">
            <a href="${safeUrl}" style="background: #ef6e71; border-radius: 8px; color: #2d2d2d; display: inline-block; font-weight: bold; padding: 12px 20px; text-decoration: none;">${action}</a>
          </p>
          <p>El enlace caduca en 48 horas. Si no has solicitado este email, puedes ignorarlo.</p>
        </div>
      `,
    }, {
      idempotencyKey: `newsletter-confirm-${idempotencyKey}`,
    });

    if (result.error) {
      console.error('Resend confirmation email failed', result.error.name, result.error.statusCode);
      return jsonResponse({ error: 'No se pudo enviar el correo de confirmación. Inténtalo de nuevo.' }, 502);
    }

    return expectsJson
      ? jsonResponse({ success: true })
      : Response.redirect(new URL(successUrl, request.url), 303);
  } catch (error) {
    console.error('Resend confirmation exception:', error instanceof Error ? error.name : 'UnknownError');
    return jsonResponse({ error: 'No se pudo enviar el correo de confirmación. Inténtalo de nuevo.' }, 502);
  }
};
