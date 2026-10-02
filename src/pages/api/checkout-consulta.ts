import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { CONSULTATIONS_ENABLED } from '../../data/consultas';
import {
  CONSULTATION_PAYMENT_METHOD_TYPES,
  canCreateConsultationCheckout,
  getConsultationStripeMode,
  isStripeSessionMode,
} from '../../lib/consulta-payment.mjs';
import { termsConsent } from '../../lib/checkout-consent';
import { getSiteUrl } from '../../lib/site-url';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripeMode = getConsultationStripeMode(stripeKey, process.env.APP_ENV);
  if (!CONSULTATIONS_ENABLED || !stripeKey || !canCreateConsultationCheckout(stripeMode)) {
    return new Response(
      JSON.stringify({ error: 'Las consultas estarán disponibles próximamente.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const priceId = process.env.STRIPE_CONSULTA_MENSAJE_PRICE_ID;
  if (!priceId?.startsWith('price_') || priceId.includes('PLACEHOLDER')) {
    return new Response(
      JSON.stringify({ error: 'La consulta todavía no tiene un precio configurado.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stripe = new Stripe(stripeKey);
  const siteURL = getSiteUrl(request).replace(/\/$/, '');

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: CONSULTATION_PAYMENT_METHOD_TYPES,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteURL}/consulta-mensaje/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteURL}/consultas`,
      metadata: { type: 'consulta-mensaje', priceId },
      automatic_tax: { enabled: false },
      ...termsConsent(siteURL, 'consulta'),
    });

    if (!session.url || !isStripeSessionMode(session.livemode, stripeMode)) {
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
    console.error('Stripe checkout error:', err instanceof Error ? err.name : 'UnknownError');
    return new Response(
      JSON.stringify({ error: 'No se pudo iniciar el pago. Inténtalo de nuevo.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
