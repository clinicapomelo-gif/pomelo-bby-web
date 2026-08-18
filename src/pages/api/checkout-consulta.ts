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

  const priceId = import.meta.env.STRIPE_CONSULTA_MENSAJE_PRICE_ID;
  if (!priceId?.startsWith('price_') || priceId.includes('PLACEHOLDER')) {
    return new Response(
      JSON.stringify({ error: 'La consulta todavía no tiene un precio configurado.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stripe = new Stripe(stripeKey);
  const siteURL = import.meta.env.SITE_URL ?? 'https://pomelo-bby-web.vercel.app';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
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
    console.error('Stripe checkout error:', err instanceof Error ? err.message : 'Error desconocido');
    return new Response(
      JSON.stringify({ error: 'No se pudo iniciar el pago. Inténtalo de nuevo.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
