import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { CONSULTA_CORREO_MAXIMO_DIARIO, CONSULTA_CORREO_PAUSADA, CONSULTATIONS_ENABLED } from '../../data/consultas';
import {
  CONSULTATION_CHECKOUT_TTL_SECONDS,
  CONSULTATION_PAYMENT_METHOD_TYPES,
  canCreateConsultationCheckout,
  countDailyConsultations,
  getConsultationStripeMode,
  getMadridDayStart,
  isStripeSessionMode,
} from '../../lib/consulta-payment.mjs';
import { termsConsent } from '../../lib/checkout-consent';
import { getSiteUrl } from '../../lib/site-url';

export const prerender = false;

const UNAVAILABLE_MESSAGES = {
  completa: 'Hoy ya no quedan consultas por correo. Vuelve a intentarlo mañana.',
  pausada: 'Ahora mismo no estoy atendiendo consultas por correo. Vuelve a intentarlo en unos días.',
} as const;

const unavailable = (reason: keyof typeof UNAVAILABLE_MESSAGES) => new Response(
  JSON.stringify({ error: UNAVAILABLE_MESSAGES[reason], reason }),
  { status: 409, headers: { 'Content-Type': 'application/json' } }
);

export const POST: APIRoute = async ({ request }) => {
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  const stripeMode = getConsultationStripeMode(stripeKey, process.env.VERCEL_ENV);
  if (!CONSULTATIONS_ENABLED || !stripeKey || !canCreateConsultationCheckout(stripeMode)) {
    return new Response(
      JSON.stringify({ error: 'Las consultas estarán disponibles próximamente.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (CONSULTA_CORREO_PAUSADA) return unavailable('pausada');

  const priceId = import.meta.env.STRIPE_CONSULTA_MENSAJE_PRICE_ID;
  if (!priceId?.startsWith('price_') || priceId.includes('PLACEHOLDER')) {
    return new Response(
      JSON.stringify({ error: 'La consulta todavía no tiene un precio configurado.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stripe = new Stripe(stripeKey);
  const siteURL = getSiteUrl(request).replace(/\/$/, '');

  // Si no se puede comprobar el cupo, no se vende: mejor no abrir el pago que pasarse del límite.
  try {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const todaysSessions: Stripe.Checkout.Session[] = [];
    for await (const session of stripe.checkout.sessions.list({ created: { gte: getMadridDayStart() }, limit: 100 })) {
      todaysSessions.push(session);
    }
    if (countDailyConsultations(todaysSessions, stripeMode, nowSeconds) >= CONSULTA_CORREO_MAXIMO_DIARIO) {
      return unavailable('completa');
    }
  } catch (err: unknown) {
    console.error('Stripe consultation capacity error:', err instanceof Error ? err.name : 'UnknownError');
    return new Response(
      JSON.stringify({ error: 'No se pudo iniciar el pago. Inténtalo de nuevo.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: CONSULTATION_PAYMENT_METHOD_TYPES,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteURL}/consulta-mensaje/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteURL}/consultas`,
      metadata: { type: 'consulta-mensaje', priceId },
      expires_at: Math.floor(Date.now() / 1000) + CONSULTATION_CHECKOUT_TTL_SECONDS,
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
