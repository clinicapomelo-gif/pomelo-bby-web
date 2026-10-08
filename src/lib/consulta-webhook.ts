import { Resend } from 'resend';
import type Stripe from 'stripe';
import {
  getConsultationReference,
  getConsultationStripeMode,
  isConsultationSubmissionAuthorized,
} from './consulta-payment.mjs';
import { renderEmail } from './email-template.mjs';

const text = (body: string, status = 200) => new Response(body, { status });

// Hora del cobro; la sesión se crea al abrir el pago, que puede ser bastante antes.
const getPaidAt = (session: Stripe.Checkout.Session) => {
  const paymentIntent = session.payment_intent;
  const charge = paymentIntent && typeof paymentIntent === 'object' ? paymentIntent.latest_charge : undefined;
  return charge && typeof charge === 'object' ? charge.created : session.created;
};

// Avisa a Mar y a la familia en cuanto Stripe confirma el pago, aunque la familia no
// vuelva a la web. Si algo falla responde 500 y Stripe reintenta; las claves de
// idempotencia evitan correos duplicados.
export const handlePaidConsultation = async (
  stripe: Stripe,
  sessionId: string,
  siteURL: string,
  reference: string,
): Promise<Response> => {
  const stripeMode = getConsultationStripeMode(process.env.STRIPE_SECRET_KEY, process.env.APP_ENV);
  const resendKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_FROM_EMAIL;
  const marEmail = process.env.RESEND_CONSULTA_TO_EMAIL;
  if (!stripeMode || !resendKey || !sender || !marEmail) {
    return text('Servicio de avisos no configurado', 503);
  }

  let session: Stripe.Checkout.Session;
  let lineItems: Stripe.ApiList<Stripe.LineItem>;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['payment_intent.latest_charge'] });
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
  }).format(new Date(getPaidAt(session) * 1000));

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

    const toFamily = await resend.emails.send({
      from: sender,
      to: familyEmail,
      subject: `He recibido tu pago (${consultaRef}) — Pomelo Baby`,
      ...renderEmail({
        siteUrl: siteURL,
        preheader: `Tu referencia es ${consultaRef}. Si aún no me has contado tu caso, puedes hacerlo aquí.`,
        greeting: 'Hola,',
        paragraphs: [
          ['He recibido el pago de tu consulta por correo. Tu referencia es ', { strong: consultaRef }, '.'],
          'Si todavía no me has contado tu caso, puedes hacerlo aquí:',
        ],
        button: { label: 'Contar mi caso', href: formURL.toString() },
        afterButton: ['Si ya lo has enviado, no tienes que hacer nada más: te respondo en 24-48 horas laborables.'],
      }),
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
