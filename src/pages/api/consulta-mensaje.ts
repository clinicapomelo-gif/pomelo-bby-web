import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import Stripe from 'stripe';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const resendKey = import.meta.env.RESEND_API_KEY;
  if (!resendKey) {
    return new Response(
      JSON.stringify({ error: 'Resend no está configurado.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  const resend = new Resend(resendKey);

  const formData = await request.formData();
  const sessionId = formData.get('session_id')?.toString() || '';
  const nombre = formData.get('nombre')?.toString() || '';
  const email = formData.get('email')?.toString() || '';
  const edad = formData.get('edad')?.toString() || '';
  const motivo = formData.get('motivo')?.toString() || '';
  const contexto = formData.get('contexto')?.toString() || '';

  // Verificar pago válido
  if (!sessionId || !stripeKey) {
    return new Response(
      JSON.stringify({ error: 'Sesión de pago no válida.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid' || session.metadata?.type !== 'consulta-mensaje') {
      return new Response(
        JSON.stringify({ error: 'Pago no verificado.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch {
    return new Response(
      JSON.stringify({ error: 'No se pudo verificar el pago.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!nombre || !email || !edad || !motivo) {
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
      subject: `Consulta por mensaje de ${nombre} — pomelo.bby`,
      html: `
        <h2>Nueva consulta por mensaje</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Edad del bebé:</strong> ${edad}</p>
        <hr />
        <h3>¿Qué le preocupa?</h3>
        <p>${motivo.replace(/\n/g, '<br />')}</p>
        ${contexto ? `<hr /><h3>Contexto adicional</h3><p>${contexto.replace(/\n/g, '<br />')}</p>` : ''}
        <hr />
        <p><em>Responder a este email contesta directamente a ${nombre} (${email})</em></p>
      `,
    });

    return redirect('/consulta-mensaje/enviado', 303);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('Resend error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
