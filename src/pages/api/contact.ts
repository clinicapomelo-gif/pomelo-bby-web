import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  const resendKey = import.meta.env.RESEND_API_KEY;
  const fromEmail = import.meta.env.RESEND_FROM_EMAIL;
  const toEmail = import.meta.env.RESEND_TO_EMAIL;
  if (!resendKey || !fromEmail || !toEmail) {
    return new Response(
      JSON.stringify({ error: 'Servicio de email no configurado.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const resend = new Resend(resendKey);

  let nombre: string | undefined;
  let email: string | undefined;
  let mensaje: string | undefined;
  let honeypot: string | undefined;

  const contentType = request.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      const body = await request.json();
      nombre = typeof body.nombre === 'string' ? body.nombre : undefined;
      email = typeof body.email === 'string' ? body.email : undefined;
      mensaje = typeof body.mensaje === 'string' ? body.mensaje : undefined;
      honeypot = typeof body.website === 'string' ? body.website : undefined;
    } else {
      const formData = await request.formData();
      nombre = formData.get('nombre')?.toString();
      email = formData.get('email')?.toString();
      mensaje = formData.get('mensaje')?.toString();
      honeypot = formData.get('website')?.toString();
    }
  } catch {
    return new Response(
      JSON.stringify({ error: 'Datos mal formados.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Honeypot: si este campo tiene valor, es un bot
  if (honeypot) {
    return Response.redirect(new URL('/gracias', request.url), 303);
  }

  nombre = nombre?.trim();
  email = email?.trim().toLowerCase();
  mensaje = mensaje?.trim();

  if (!nombre || nombre.length > 100 || !email || email.length > 254 || !EMAIL_REGEX.test(email) || !mensaje || mensaje.length > 5000) {
    return new Response(
      JSON.stringify({ error: 'Revisa los campos del formulario.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `Nuevo mensaje de ${nombre} — pomelo.bby`,
      text: `Nuevo mensaje desde la web\n\nNombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${mensaje}`,
    });

    if (error) {
      console.error('Resend contact error:', error.name);
      return new Response(
        JSON.stringify({ error: 'No se pudo enviar el mensaje.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return Response.redirect(new URL('/gracias', request.url), 303);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('Resend error:', message);
    return new Response(
      JSON.stringify({ error: 'No se pudo enviar el mensaje.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
