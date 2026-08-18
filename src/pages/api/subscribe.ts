import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      return new Response(
        JSON.stringify({ error: 'Origen no permitido.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  let email: string | undefined;
  let nombre: string | undefined;
  let honeypot: string | undefined;
  let privacy: string | undefined;

  const contentType = request.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      const body: unknown = await request.json();
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
      const values = body as Record<string, unknown>;
      email = typeof values.email === 'string' ? values.email : undefined;
      nombre = typeof values.nombre === 'string' ? values.nombre : undefined;
      honeypot = typeof values.website === 'string' ? values.website : undefined;
      privacy = typeof values.privacy === 'string' ? values.privacy : undefined;
    } else {
      const formData = await request.formData();
      email = formData.get('email')?.toString();
      nombre = formData.get('nombre')?.toString();
      honeypot = formData.get('website')?.toString();
      privacy = formData.get('privacy')?.toString();
    }
  } catch {
    return new Response(
      JSON.stringify({ error: 'Datos mal formados.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (honeypot) {
    if (contentType.includes('application/json')) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return Response.redirect(new URL('/newsletter/gracias', request.url), 303);
  }

  const cleanEmail = email?.trim().toLowerCase();
  if (!cleanEmail || cleanEmail.length > 254 || !EMAIL_REGEX.test(cleanEmail)) {
    return new Response(
      JSON.stringify({ error: 'Email no válido.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!privacy || !['on', 'true', '1'].includes(privacy)) {
    return new Response(
      JSON.stringify({ error: 'Debes aceptar la política de privacidad.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const resendKey = import.meta.env.RESEND_API_KEY;
  const audienceId = import.meta.env.RESEND_AUDIENCE_ID;
  if (!resendKey || !audienceId) {
    return new Response(
      JSON.stringify({ error: 'Servicio de suscripción no configurado.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
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
      console.error('Resend contact error:', contactError.name);
      return new Response(
        JSON.stringify({ error: 'No se pudo completar la suscripción.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (contentType.includes('application/json')) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return Response.redirect(new URL('/newsletter/gracias', request.url), 303);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('Resend subscribe error:', message);
    return new Response(
      JSON.stringify({ error: 'No se pudo completar la suscripción.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
