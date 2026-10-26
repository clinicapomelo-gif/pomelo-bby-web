#!/usr/bin/env node
// Programa la encuesta de satisfacción para las compras Live hechas antes de activarla.
// Sin --apply solo lista lo que haría. Usa la misma programación que el webhook: una
// semana después del pago, a las 10:00 de Madrid; si esa fecha ya pasó, mañana a las 10:00.
// Necesita en el .env local: STRIPE_LIVE_SECRET_KEY, RESEND_API_KEY y RESEND_FROM_EMAIL.
// No muestra emails ni datos personales: solo la referencia de cada compra.
import { Resend } from 'resend';
import Stripe from 'stripe';
import guias from '../src/data/guias.json' with { type: 'json' };
import { isRefundedConsultation } from '../src/lib/consulta-payment.mjs';
import { ENCUESTA_DIAS, getSurveySendAt, scheduleSatisfactionSurvey } from '../src/lib/encuesta.mjs';

const DESDE = '2026-10-19'; // Apertura de la web.
const SITE_URL = 'https://pomelobaby.es';
const DAY = 24 * 60 * 60;

const apply = process.argv.includes('--apply');
const stripeKey = process.env.STRIPE_LIVE_SECRET_KEY;
// Mejor una clave restringida (rk_live_) con Checkout Sessions: escritura y Charges y
// PaymentIntents: lectura.
if (!/^(sk|rk)_live_/.test(stripeKey ?? '')) {
  console.error('STRIPE_LIVE_SECRET_KEY debe ser una clave Live (rk_live_ o sk_live_) guardada solo en tu .env local.');
  process.exit(1);
}
if (apply && (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL)) {
  console.error('Para --apply faltan RESEND_API_KEY o RESEND_FROM_EMAIL en el .env local.');
  process.exit(1);
}

const stripe = new Stripe(stripeKey);
const resend = apply ? new Resend(process.env.RESEND_API_KEY) : undefined;
const now = Math.floor(Date.now() / 1000);
const madrid = (iso) => new Date(iso).toLocaleString('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'short', timeStyle: 'short' });

const sessions = await stripe.checkout.sessions.list({
  created: { gte: Math.floor(new Date(`${DESDE}T00:00:00+02:00`).getTime() / 1000) },
  status: 'complete',
  limit: 100,
  expand: ['data.payment_intent.latest_charge'],
}).autoPagingToArray({ limit: 1000 });

let programadas = 0;
for (const session of sessions) {
  const ref = session.id.slice(-8);
  const guia = session.metadata?.type === 'guia' && guias.find((item) => item.id === session.metadata?.guiaId);
  const product = session.metadata?.type === 'consulta-mensaje' ? 'consulta' : guia ? 'guia' : undefined;
  const paymentIntent = session.payment_intent;
  const skip =
    !session.livemode ? 'no es Live' :
    session.payment_status !== 'paid' ? 'sin pagar' :
    !product ? 'producto desconocido' :
    isRefundedConsultation(session) ? 'devuelta' :
    session.metadata?.encuestaEmailId ? 'ya programada' :
    typeof paymentIntent === 'object' && paymentIntent?.metadata?.opinion ? 'ya respondida' :
    !session.customer_details?.email ? 'sin email' :
    undefined;
  const productName = product === 'guia' ? guia.title : 'Consulta por correo';
  if (skip) {
    console.log(`- ${ref} ${productName ?? ''}: se omite (${skip})`);
    continue;
  }

  const charge = typeof paymentIntent === 'object' ? paymentIntent?.latest_charge : undefined;
  const paidAt = typeof charge === 'object' && charge ? charge.created : session.created;
  // Si la semana ya ha pasado, se programa como si se hubiera pagado hace 6 días: mañana a las 10:00.
  const scheduledPaidAt = getSurveySendAt(paidAt) > new Date().toISOString() ? paidAt : now - (ENCUESTA_DIAS - 1) * DAY;
  const sendAt = getSurveySendAt(scheduledPaidAt);

  if (!apply) {
    console.log(`+ ${ref} ${productName}: se programaría para el ${madrid(sendAt)}`);
    programadas++;
    continue;
  }

  const id = await scheduleSatisfactionSurvey(resend, {
    from: process.env.RESEND_FROM_EMAIL,
    to: session.customer_details.email.trim(),
    siteUrl: SITE_URL,
    sessionId: session.id,
    paidAt: scheduledPaidAt,
    product,
    productName,
    reference: ref,
  });
  if (!id) {
    console.error(`! ${ref} ${productName}: no se pudo programar`);
    process.exitCode = 1;
    continue;
  }
  // Mismo campo que el webhook, para que una devolución la cancele.
  await stripe.checkout.sessions.update(session.id, { metadata: { encuestaEmailId: id } });
  console.log(`+ ${ref} ${productName}: programada para el ${madrid(sendAt)}`);
  programadas++;
}

console.log(`\n${programadas} ${apply ? 'programadas' : 'por programar (ejecuta con --apply para hacerlo)'}.`);
