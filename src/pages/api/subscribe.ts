import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  const resendKey = import.meta.env.RESEND_API_KEY;
  const audienceId = import.meta.env.RESEND_AUDIENCE_ID;

  if (!resendKey || !audienceId) {
    return new Response(
      JSON.stringify({ error: 'Servicio de suscripción no configurado.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const origin = request.headers.get('origin') || '';
  const siteUrl = import.meta.env.SITE_URL || 'pomelo-bby-web.vercel.app';
  if (origin && !origin.includes(siteUrl) && !origin.includes('localhost')) {
    return new Response(
      JSON.stringify({ error: 'Origen no permitido.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const resend = new Resend(resendKey);

  let email: string | undefined;
  let nombre: string | undefined;
  let honeypot: string | undefined;
  let privacy: string | undefined;

  const contentType = request.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      const body = await request.json();
      email = body.email;
      nombre = body.nombre;
      honeypot = body.website;
      privacy = body.privacy;
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

  if (!email || !EMAIL_REGEX.test(email)) {
    return new Response(
      JSON.stringify({ error: 'Email no válido.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!privacy) {
    return new Response(
      JSON.stringify({ error: 'Debes aceptar la política de privacidad.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const cleanNombre = nombre ? nombre.slice(0, 100).trim() : undefined;

  try {
    await resend.contacts.create({
      email,
      firstName: cleanNombre || undefined,
      audienceId,
    });

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
