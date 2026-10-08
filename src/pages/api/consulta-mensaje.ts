import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import Stripe from 'stripe';
import {
  getConsultationReference,
  getConsultationStripeMode,
  isConsultationSubmissionAuthorized,
  isRefundedConsultation,
} from '../../lib/consulta-payment.mjs';
import { renderEmail } from '../../lib/email-template.mjs';
import { getSiteUrl } from '../../lib/site-url';

export const prerender = false;

const getString = (value: unknown) => typeof value === 'string' ? value : '';
const RESEND_ATTEMPTS = 3;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const POST: APIRoute = async ({ request, redirect }) => {
  const isJson = request.headers.get('content-type')?.includes('application/json') ?? false;
  let sessionId = '';
  // Con JavaScript, el formulario muestra el error; sin él, se vuelve al formulario con un aviso.
  const fail = (status: number, error: string) => {
    if (isJson) {
      return new Response(JSON.stringify({ error }), { status, headers: { 'Content-Type': 'application/json' } });
    }
    const back = new URL('/consulta-mensaje/gracias', request.url);
    if (sessionId) back.searchParams.set('session_id', sessionId);
    back.searchParams.set('error', '1');
    return redirect(`${back.pathname}${back.search}`, 303);
  };

  const resendKey = import.meta.env.RESEND_API_KEY;
  const fromEmail = import.meta.env.RESEND_FROM_EMAIL;
  const toEmail = import.meta.env.RESEND_CONSULTA_TO_EMAIL;
  if (!resendKey || !fromEmail || !toEmail) {
    return fail(503, 'El envío no está disponible ahora mismo. Inténtalo de nuevo más tarde.');
  }

  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  const stripeMode = getConsultationStripeMode(stripeKey, process.env.VERCEL_ENV);
  const resend = new Resend(resendKey);

  let values: Record<string, unknown>;
  try {
    if (isJson) {
      const body: unknown = await request.json();
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
      values = body as Record<string, unknown>;
    } else {
      values = Object.fromEntries(await request.formData());
    }
  } catch {
    return fail(400, 'Datos mal formados.');
  }

  sessionId = getString(values.session_id).trim();
  const nombre = getString(values.nombre).trim();
  const telefono = getString(values.telefono).trim();
  const edad = getString(values.edad).trim();
  const motivo = getString(values.motivo).trim();
  const contexto = getString(values.contexto).trim();

  // Verificar pago válido
  if (
    !sessionId.startsWith('cs_') || sessionId.length > 255 ||
    !stripeKey || !stripeMode
  ) {
    sessionId = '';
    return fail(403, 'Sesión de pago no válida.');
  }

  const stripe = new Stripe(stripeKey);
  let session: Stripe.Checkout.Session;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['payment_intent.latest_charge'] });
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 2 });
    if (!isConsultationSubmissionAuthorized(session, lineItems, stripeMode)) {
      return fail(403, 'Pago no verificado.');
    }

    if (session.metadata?.consultaEnviada === 'true') {
      return redirect('/consulta-mensaje/enviado', 303);
    }

    if (isRefundedConsultation(session)) {
      return fail(403, 'Este pago se ha devuelto, así que ya no puedo recibir el caso. Si crees que es un error, escríbeme desde Contacto.');
    }
  } catch {
    return fail(503, 'No se pudo verificar el pago. Inténtalo de nuevo en unos minutos.');
  }

  if (
    !nombre || nombre.length > 100 ||
    telefono.length > 30 ||
    !edad || edad.length > 100 ||
    !motivo || motivo.length > 10000 ||
    contexto.length > 5000
  ) {
    return fail(400, 'Revisa los campos del formulario.');
  }

  // El email es el del pago: es al que Mar responde y el que Stripe ya ha verificado.
  const email = session.customer_details!.email!.trim().toLowerCase();
  const reference = getConsultationReference(sessionId);

  // Los reintentos usan la misma clave de idempotencia: nunca duplican el caso.
  let sent = false;
  for (let attempt = 1; attempt <= RESEND_ATTEMPTS && !sent; attempt += 1) {
    try {
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        replyTo: email,
        subject: `Nueva consulta por mensaje ${reference} — Pomelo Baby`,
        text: `Nueva consulta por mensaje\n\nReferencia: ${reference}\nNombre: ${nombre}\nEmail: ${email}${telefono ? `\nTeléfono de contacto: ${telefono}` : ''}\nEdad del bebé: ${edad}\n\n¿Qué le preocupa?\n${motivo}${contexto ? `\n\nContexto adicional\n${contexto}` : ''}`,
      }, {
        idempotencyKey: `consulta-mensaje-${sessionId}`,
      });

      if (error) {
        console.error('Resend consultation error:', attempt, error.name, error.statusCode);
      } else {
        sent = true;
      }
    } catch (err: unknown) {
      console.error('Resend consultation exception:', attempt, err instanceof Error ? err.name : 'UnknownError');
    }

    if (!sent && attempt < RESEND_ATTEMPTS) await wait(500 * attempt);
  }

  if (!sent) {
    return fail(502, 'No se pudo enviar la consulta.');
  }

  try {
    await stripe.checkout.sessions.update(sessionId, {
      metadata: {
        consultaEnviada: 'true',
        consultaEnviadaAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error('Stripe consultation metadata error:', error instanceof Error ? error.name : 'UnknownError');
  }

  try {
    const confirmation = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `He recibido tu consulta (${reference}) — Pomelo Baby`,
      ...renderEmail({
        siteUrl: getSiteUrl(request),
        preheader: 'Ya tengo tu caso. Te respondo en 24-48 horas laborables.',
        greeting: `Hola, ${nombre}.`,
        paragraphs: [
          `He recibido tu consulta correctamente. ${telefono ? 'Te responderé en un plazo de 24-48 horas laborables, por WhatsApp o por correo.' : 'Te responderé a este correo en un plazo de 24-48 horas laborables.'}`,
          'Si para valorar tu caso hacen falta fotos o vídeos, te explicaré el siguiente paso cuando te responda. No los envíes todavía.',
          'Si la situación empeora o crees que puede ser urgente, busca atención sanitaria sin esperar mi respuesta.',
          'Gracias por confiar en Pomelo Baby.',
        ],
      }),
    }, {
      idempotencyKey: `consulta-mensaje-confirmacion-${sessionId}`,
    });

    if (confirmation.error) {
      console.error('Resend consultation confirmation error:', confirmation.error.name, confirmation.error.statusCode);
    }
  } catch (error: unknown) {
    console.error('Resend consultation confirmation exception:', error instanceof Error ? error.name : 'UnknownError');
  }

  return redirect('/consulta-mensaje/enviado', 303);
};
