import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const prerender = false;

export const POST: APIRoute = async () => {
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey === 'sk_test_PLACEHOLDER') {
    return new Response(
      JSON.stringify({ error: 'Stripe no está configurado todavía.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stripe = new Stripe(stripeKey);
  const siteURL = import.meta.env.SITE_URL ?? 'https://pomelo-bby-web.vercel.app';

  // TODO: Crear este producto/precio en Stripe y actualizar el ID
  const CONSULTA_MENSAJE_PRICE_ID = import.meta.env.STRIPE_CONSULTA_MENSAJE_PRICE_ID ?? 'price_PLACEHOLDER';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: CONSULTA_MENSAJE_PRICE_ID, quantity: 1 }],
      success_url: `${siteURL}/consulta-mensaje/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteURL}/consultas`,
      metadata: { type: 'consulta-mensaje' },
      automatic_tax: { enabled: false },
    });

    if (!session.url) {
      return new Response(
        JSON.stringify({ error: 'No se pudo crear la sesión de pago.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('Stripe error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
