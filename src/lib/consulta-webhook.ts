import { Resend } from 'resend';
import type Stripe from 'stripe';
import {
  getConsultationReference,
  getConsultationStripeMode,
  isConsultationSubmissionAuthorized,
} from './consulta-payment.mjs';

const text = (body: string, status = 200) => new Response(body, { status });

// Avisa a Mar y a la familia en cuanto Stripe confirma el pago, aunque la familia no
// vuelva a la web. Si algo falla responde 500 y Stripe reintenta; las claves de
// idempotencia evitan correos duplicados.
export const handlePaidConsultation = async (
  stripe: Stripe,
  sessionId: string,
  siteURL: string,
  reference: string,
): Promise<Response> => {
  const stripeMode = getConsultationStripeMode(import.meta.env.STRIPE_SECRET_KEY, process.env.VERCEL_ENV);
  const resendKey = import.meta.env.RESEND_API_KEY;
  const sender = import.meta.env.RESEND_FROM_EMAIL;
  const marEmail = import.meta.env.RESEND_CONSULTA_TO_EMAIL;
  if (!stripeMode || !resendKey || !sender || !marEmail) {
    return text('Servicio de avisos no configurado', 503);
  }

  let session: Stripe.Checkout.Session;
  let lineItems: Stripe.ApiList<Stripe.LineItem>;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
    lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 2 });
  } catch (error: unknown) {
    console.error('Consultation session retrieval error:', reference, error instanceof Error ? error.name : 'UnknownError');
    return text('No se pudo comprobar la consulta', 500);
  }

  if (session.payment_status !== 'paid') return text('OK');
  if (!isConsultationSubmissionAuthorized(session, lineItems, stripeMode)) {
    console.error('Consultation payment mismatch:', reference);
    return text('La consulta no corresponde a este entorno', 500);
  }
  if (session.metadata?.avisoEnviado === 'true') return text('OK');

  const familyEmail = session.customer_details!.email!.trim();
  const consultaRef = getConsultationReference(session.id);
  const paidAt = new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Madrid',
  }).format(new Date(session.created * 1000));

  let formURL: URL;
  try {
    formURL = new URL('/consulta-mensaje/gracias', siteURL);
    formURL.searchParams.set('session_id', session.id);
  } catch {
    return text('Servicio de avisos no configurado', 503);
  }

  try {
    const resend = new Resend(resendKey);
    const toMar = await resend.emails.send({
      from: sender,
      to: marEmail,
      replyTo: familyEmail,
      subject: `Consulta por correo pagada ${consultaRef} — Pomelo Baby`,
      text: `Se ha pagado una consulta por correo.\n\nReferencia: ${consultaRef}\nEmail de la familia: ${familyEmail}\nPago: ${paidAt}\n\nCuando la familia envíe su caso te llegará otro correo con esta misma referencia. Si en 24 horas no ha llegado, puedes escribirle tú primero respondiendo a este correo.`,
    }, { idempotencyKey: `consulta-aviso-mar-${session.id}` });

    // TODO(Mar): texto provisional.
    const toFamily = await resend.emails.send({
      from: sender,
      to: familyEmail,
      subject: `He recibido tu pago (${consultaRef}) — Pomelo Baby`,
      text: `Hola,\n\nHe recibido el pago de tu consulta por correo. Tu referencia es ${consultaRef}.\n\nSi todavía no me has contado tu caso, puedes hacerlo aquí:\n${formURL.toString()}\n\nSi ya lo has enviado, no tienes que hacer nada más: te respondo en 24-48 horas laborables.\n\nMar · Pomelo Baby`,
    }, { idempotencyKey: `consulta-pago-familia-${session.id}` });

    if (toMar.error || toFamily.error) {
      console.error('Consultation notice error:', reference, toMar.error?.name ?? toFamily.error?.name);
      return text('No se pudo avisar de la consulta', 500);
    }

    await stripe.checkout.sessions.update(session.id, {
      metadata: { avisoEnviado: 'true', avisoEnviadoAt: new Date().toISOString() },
    });
  } catch (error: unknown) {
    console.error('Consultation notice exception:', reference, error instanceof Error ? error.name : 'UnknownError');
    return text('No se pudo avisar de la consulta', 500);
  }

  return text('OK');
};
