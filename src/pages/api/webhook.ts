import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { guias } from '../../data/guias';

export const POST: APIRoute = async ({ request }) => {
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return new Response('Stripe no configurado', { status: 503 });
  }

  const stripe = new Stripe(stripeKey);
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Firma no encontrada', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return new Response('Firma inválida', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const guiaId = session.metadata?.guiaId;
    const customerEmail = session.customer_details?.email;

    if (!guiaId || !customerEmail) {
      return new Response('Datos incompletos', { status: 400 });
    }

    const guia = guias.find((g) => g.id === guiaId);
    if (!guia) {
      return new Response('Guía no encontrada', { status: 404 });
    }

    // TODO: aquí iría la lógica de envío del email con el link de descarga
    // Por ahora solo registramos el evento
    console.log(`Compra completada: ${guia.title} por ${customerEmail}`);
  }

  return new Response('OK', { status: 200 });
};
