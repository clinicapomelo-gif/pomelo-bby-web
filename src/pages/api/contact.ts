import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const resendKey = import.meta.env.RESEND_API_KEY;
  if (!resendKey) {
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
  if (contentType.includes('application/json')) {
    const body = await request.json();
    nombre = body.nombre;
    email = body.email;
    mensaje = body.mensaje;
    honeypot = body.website;
  } else {
    const formData = await request.formData();
    nombre = formData.get('nombre')?.toString();
    email = formData.get('email')?.toString();
    mensaje = formData.get('mensaje')?.toString();
    honeypot = formData.get('website')?.toString();
  }

  // Honeypot: si este campo tiene valor, es un bot
  if (honeypot) {
    return Response.redirect(new URL('/gracias', request.url), 303);
  }

  if (!nombre || !email || !mensaje) {
    return new Response(
      JSON.stringify({ error: 'Faltan campos obligatorios.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    await resend.emails.send({
      from: 'pomelo.bby <onboarding@resend.dev>',
      to: 'rafallytbprm@gmail.com',
      replyTo: email,
      subject: `Nuevo mensaje de ${nombre} — pomelo.bby`,
      html: `
        <h2>Nuevo mensaje desde la web</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje.replace(/\n/g, '<br>')}</p>
      `,
    });

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
