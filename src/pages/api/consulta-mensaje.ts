import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import Stripe from 'stripe';

export const prerender = false;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, redirect }) => {
  const resendKey = import.meta.env.RESEND_API_KEY;
  const fromEmail = import.meta.env.RESEND_FROM_EMAIL;
  const toEmail = import.meta.env.RESEND_CONSULTA_TO_EMAIL;
  if (!resendKey || !fromEmail || !toEmail) {
    return new Response(
      JSON.stringify({ error: 'El envío no está disponible ahora mismo. Inténtalo de nuevo más tarde.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  const priceId = import.meta.env.STRIPE_CONSULTA_MENSAJE_PRICE_ID;
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
  if (
    !sessionId.startsWith('cs_') || sessionId.length > 255 ||
    !stripeKey || !priceId?.startsWith('price_')
  ) {
    return new Response(
      JSON.stringify({ error: 'Sesión de pago no válida.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stripe = new Stripe(stripeKey);
  let session: Stripe.Checkout.Session;
  let customerEmail: string;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 2 });
    customerEmail = session.customer_details?.email?.trim().toLowerCase() ?? '';
    if (
      session.payment_status !== 'paid' ||
      session.metadata?.type !== 'consulta-mensaje' ||
      lineItems.data.length !== 1 ||
      lineItems.data[0]?.price?.id !== priceId ||
      !customerEmail
    ) {
      return new Response(
        JSON.stringify({ error: 'Pago no verificado.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (session.metadata?.consultaEnviada === 'true') {
      return redirect('/consulta-mensaje/enviado', 303);
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
    contexto.length > 5000 ||
    email !== customerEmail
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
      subject: 'Nueva consulta por mensaje — pomelo.bby',
      text: `Nueva consulta por mensaje\n\nNombre: ${nombre}\nEmail: ${email}\nEdad del bebé: ${edad}\n\n¿Qué le preocupa?\n${motivo}${contexto ? `\n\nContexto adicional\n${contexto}` : ''}`,
    }, {
      idempotencyKey: `consulta-mensaje-${sessionId}`,
    });

    if (error) {
      console.error('Resend consultation error:', error.name, error.statusCode);
      return new Response(
        JSON.stringify({ error: 'No se pudo enviar la consulta.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      await stripe.checkout.sessions.update(sessionId, {
        metadata: {
          consultaEnviada: 'true',
          consultaEnviadaAt: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      console.error('Stripe consultation metadata error:', error instanceof Error ? error.name : 'UnknownError');
    }

    try {
      const confirmation = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'He recibido tu consulta — pomelo.bby',
        text: `Hola, ${nombre}.\n\nHe recibido tu consulta correctamente. Te responderé a este correo en un plazo de 24-48 horas laborables.\n\nSi para valorar tu caso hacen falta fotos o vídeos, te explicaré el siguiente paso cuando te responda. No los envíes todavía.\n\nSi la situación empeora o crees que puede ser urgente, busca atención sanitaria sin esperar mi respuesta.\n\nGracias por confiar en pomelo.bby.`,
      }, {
        idempotencyKey: `consulta-mensaje-confirmacion-${sessionId}`,
      });

      if (confirmation.error) {
        console.error('Resend consultation confirmation error:', confirmation.error.name, confirmation.error.statusCode);
      }
    } catch (error: unknown) {
      console.error('Resend consultation confirmation exception:', error instanceof Error ? error.name : 'UnknownError');
    }

    return redirect('/consulta-mensaje/enviado', 303);
  } catch (err: unknown) {
    console.error('Resend consultation exception:', err instanceof Error ? err.name : 'UnknownError');
    return new Response(
      JSON.stringify({ error: 'No se pudo enviar la consulta.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
