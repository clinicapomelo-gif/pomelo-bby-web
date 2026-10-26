import Stripe from 'stripe';
import { getStripeMode, guias } from '../data/guias';
import { isCheckoutSessionIdForMode, isRefundedConsultation, isStripeSessionMode } from './consulta-payment.mjs';
import { OPINION_MAX_DIAS } from './encuesta.mjs';

// El enlace de la encuesta usa el session_id de Stripe, como el de descarga de las guías y
// el formulario de la consulta: es largo y aleatorio, y no da acceso a datos personales.
// Uno de otro modo (Sandbox en Live) o inventado se rechaza sin llamar a Stripe.
export const isValidSessionId = (value: unknown): value is string =>
  isCheckoutSessionIdForMode(value, getStripeMode(process.env.STRIPE_SECRET_KEY));

export interface OpinionPurchase {
  stripe: Stripe;
  session: Stripe.Checkout.Session;
  paymentIntent: Stripe.PaymentIntent;
  product: 'guia' | 'consulta';
  productName: string;
  answered: boolean;
}

// undefined si el enlace no vale: no existe, es de otro entorno, no está pagado, se ha
// devuelto o ha caducado. Lanza si Stripe no responde, para poder ofrecer reintentar.
export const loadOpinionPurchase = async (sessionId: string): Promise<OpinionPurchase | undefined> => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const mode = getStripeMode(stripeKey);
  if (!stripeKey || !mode) throw new Error('StripeNotConfigured');

  const stripe = new Stripe(stripeKey);
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['payment_intent.latest_charge'] });
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeInvalidRequestError) return undefined;
    throw error;
  }

  const paymentIntent = session.payment_intent;
  const expiresAt = session.created + OPINION_MAX_DIAS * 24 * 60 * 60;
  if (
    !isStripeSessionMode(session.livemode, mode) ||
    session.payment_status !== 'paid' ||
    !paymentIntent || typeof paymentIntent !== 'object' ||
    isRefundedConsultation(session) ||
    expiresAt < Date.now() / 1000
  ) return undefined;

  let product: OpinionPurchase['product'];
  let productName: string;
  if (session.metadata?.type === 'consulta-mensaje') {
    product = 'consulta';
    productName = 'Consulta por correo';
  } else {
    const guia = session.metadata?.type === 'guia' && guias.find((item) => item.id === session.metadata?.guiaId);
    if (!guia) return undefined;
    product = 'guia';
    productName = guia.title;
  }

  return { stripe, session, paymentIntent, product, productName, answered: Boolean(paymentIntent.metadata?.opinion) };
};
