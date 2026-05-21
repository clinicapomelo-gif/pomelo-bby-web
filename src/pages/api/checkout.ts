import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { guias } from '../../data/guias';

export const POST: APIRoute = async ({ request }) => {
  // Stripe no está configurado todavía — devuelve error claro
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey === 'sk_test_PLACEHOLDER') {
    return new Response(
      JSON.stringify({ error: 'Stripe no está configurado todavía.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stripe = new Stripe(stripeKey);

  const formData = await request.formData();
  const priceId = formData.get('priceId')?.toString();
  const guiaId = formData.get('guiaId')?.toString();

  if (!priceId || !guiaId) {
    return new Response(
      JSON.stringify({ error: 'Faltan parámetros.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const guia = guias.find((g) => g.id === guiaId);
  if (!guia) {
    return new Response(
      JSON.stringify({ error: 'Producto no encontrado.' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const siteURL = import.meta.env.SITE_URL ?? 'https://pomelo-bby-web.vercel.app';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteURL}/tienda/gracias?session_id={CHECKOUT_SESSION_ID}&guia=${guiaId}`,
      cancel_url: `${siteURL}/tienda/${guiaId}`,
      metadata: { guiaId },
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
