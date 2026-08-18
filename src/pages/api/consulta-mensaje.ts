import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import Stripe from 'stripe';

export const prerender = false;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, redirect }) => {
  const resendKey = import.meta.env.RESEND_API_KEY;
  const fromEmail = import.meta.env.RESEND_FROM_EMAIL;
  const toEmail = import.meta.env.RESEND_TO_EMAIL;
  if (!resendKey || !fromEmail || !toEmail) {
    return new Response(
      JSON.stringify({ error: 'Resend no está configurado.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  const resend = new Resend(resendKey);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Datos mal formados.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const sessionId = formData.get('session_id')?.toString().trim() || '';
  const nombre = formData.get('nombre')?.toString().trim() || '';
  const email = formData.get('email')?.toString().trim().toLowerCase() || '';
  const edad = formData.get('edad')?.toString().trim() || '';
  const motivo = formData.get('motivo')?.toString().trim() || '';
  const contexto = formData.get('contexto')?.toString().trim() || '';

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

  if (
    !nombre || nombre.length > 100 ||
    !email || email.length > 254 || !EMAIL_REGEX.test(email) ||
    !edad || edad.length > 100 ||
    !motivo || motivo.length > 10000 ||
    contexto.length > 5000
  ) {
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
      subject: `Consulta por mensaje de ${nombre} — pomelo.bby`,
      text: `Nueva consulta por mensaje\n\nNombre: ${nombre}\nEmail: ${email}\nEdad del bebé: ${edad}\n\n¿Qué le preocupa?\n${motivo}${contexto ? `\n\nContexto adicional\n${contexto}` : ''}`,
    });

    if (error) {
      console.error('Resend consultation error:', error.name);
      return new Response(
        JSON.stringify({ error: 'No se pudo enviar la consulta.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

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
