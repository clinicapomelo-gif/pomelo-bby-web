import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import Stripe from 'stripe';
import { authorizeGuidePurchase, getStripeMode, guias } from '../../data/guias';
import { getGuideDownloadExpiresAt } from '../../lib/guide-delivery';
import { isPrivateGuidePdfAvailable } from '../../lib/guide-storage';
import { handlePaidConsultation } from '../../lib/consulta-webhook';
import { renderEmail } from '../../lib/email-template.mjs';
import { scheduleSatisfactionSurvey } from '../../lib/encuesta.mjs';
import { getSiteUrl } from '../../lib/site-url';

export const prerender = false;

const eventReference = (event: Stripe.Event) => event.id.slice(-8);

// Devolución total o parcial (el mismo criterio que la consulta): cancela la encuesta
// programada, si la hay. Requiere `charge.refunded` en el webhook de Stripe.
const cancelSurveyOnRefund = async (stripe: Stripe, charge: Stripe.Charge, reference: string) => {
  const paymentIntent = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntent) return new Response('OK', { status: 200 });

  let surveyEmailId: string | undefined;
  try {
    const { data } = await stripe.checkout.sessions.list({ payment_intent: paymentIntent, limit: 1 });
    surveyEmailId = data[0]?.metadata?.encuestaEmailId;
  } catch (error: unknown) {
    console.error('Refund session lookup error:', reference, error instanceof Error ? error.name : 'UnknownError');
    return new Response('No se pudo comprobar la devolución', { status: 500 });
  }
  if (!surveyEmailId) return new Response('OK', { status: 200 });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return new Response('Servicio no configurado', { status: 503 });

  // ponytail: un fallo al cancelar solo se registra (puede que ya se enviara y Stripe
  // reintentaría en vano); si se ve en los logs, cancelarla a mano en Resend.
  try {
    const { error } = await new Resend(resendKey).emails.cancel(surveyEmailId);
    if (error) console.error('Survey cancel error:', reference, error.name);
  } catch (error: unknown) {
    console.error('Survey cancel exception:', reference, error instanceof Error ? error.name : 'UnknownError');
  }
  return new Response('OK', { status: 200 });
};

export const POST: APIRoute = async ({ request }) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripeMode = getStripeMode(stripeKey);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !stripeMode || !webhookSecret) {
    return new Response('Servicio no configurado', { status: 503 });
  }

  const stripe = new Stripe(stripeKey);
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Firma no encontrada', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // En Workers la versión síncrona falla: la firma se verifica con Web Crypto.
    event = await stripe.webhooks.constructEventAsync(
      body, signature, webhookSecret, undefined, Stripe.createSubtleCryptoProvider(),
    );
  } catch {
    return new Response('Firma inválida', { status: 400 });
  }

  if (event.type === 'charge.refunded') {
    return cancelSurveyOnRefund(stripe, event.data.object as Stripe.Charge, eventReference(event));
  }

  if (
    event.type !== 'checkout.session.completed' &&
    event.type !== 'checkout.session.async_payment_succeeded'
  ) {
    return new Response('OK', { status: 200 });
  }

  const eventSession = event.data.object as Stripe.Checkout.Session;
  if (eventSession.metadata?.type === 'consulta-mensaje') {
    return handlePaidConsultation(stripe, eventSession.id, getSiteUrl(request), eventReference(event));
  }
  if (eventSession.metadata?.type !== 'guia') {
    return new Response('OK', { status: 200 });
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(eventSession.id);
  } catch (error: unknown) {
    console.error('Guide session retrieval error:', eventReference(event), error instanceof Error ? error.name : 'UnknownError');
    return new Response('No se pudo comprobar la compra', { status: 500 });
  }

  if (session.livemode !== (stripeMode === 'live')) {
    return new Response('La compra no corresponde a este entorno', { status: 500 });
  }

  if (session.payment_status !== 'paid') {
    return new Response('OK', { status: 200 });
  }

  const guia = guias.find((item) => item.id === session.metadata?.guiaId);
  const customerEmail = session.customer_details?.email;

  if (!guia || !customerEmail) {
    console.error('Guide delivery data error:', eventReference(event));
    return new Response('La compra no se puede entregar', { status: 500 });
  }

  let purchasedPriceId: string;
  let purchasedBlobKey: string;
  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 2 });
    const linePriceId = lineItems.data[0]?.price?.id;
    const authorizedBlobKey = linePriceId && authorizeGuidePurchase(
      guia,
      stripeMode,
      linePriceId,
      session.metadata?.priceId,
      session.metadata?.blobKey,
    );

    if (lineItems.data.length !== 1 || !linePriceId || !authorizedBlobKey) {
      console.error('Guide purchase mismatch:', eventReference(event));
      return new Response('La compra no coincide con la guía', { status: 500 });
    }

    purchasedPriceId = linePriceId;
    purchasedBlobKey = authorizedBlobKey;
  } catch (error: unknown) {
    console.error('Guide purchase verification error:', eventReference(event), error instanceof Error ? error.name : 'UnknownError');
    return new Response('No se pudo verificar el producto', { status: 500 });
  }

  if (session.metadata?.deliveryEmailId) {
    return new Response('OK', { status: 200 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_FROM_EMAIL;
  // Production fija SITE_URL; preview usa su propia URL, la que Stripe llama.
  const siteURL = getSiteUrl(request);

  if (!resendKey || !sender) {
    return new Response('Servicio de entrega no configurado', { status: 503 });
  }

  let downloadURL: URL;
  try {
    downloadURL = new URL('/api/guias/download', siteURL);
    downloadURL.searchParams.set('session_id', session.id);
  } catch {
    return new Response('Servicio de entrega no configurado', { status: 503 });
  }

  try {
    if (!await isPrivateGuidePdfAvailable(purchasedBlobKey)) {
      console.error('Guide PDF configuration error:', eventReference(event));
      return new Response('La guía no está disponible', { status: 500 });
    }

    const expiresAt = getGuideDownloadExpiresAt(session.created);
    const expirationDate = new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'long',
      timeZone: 'Europe/Madrid',
    }).format(new Date(expiresAt * 1000));
    const resend = new Resend(resendKey);
    const downloadLabel = guia.kind === 'complete' ? 'Descargar el ebook' : 'Descargar el PDF';
    const { data, error } = await resend.emails.send(
      {
        from: sender,
        to: customerEmail,
        subject: `Ya puedes descargar «${guia.title}»`,
        ...renderEmail({
          siteUrl: siteURL,
          preheader: `Tu guía «${guia.title}» ya está lista.`,
          greeting: 'Hola,',
          paragraphs: [['Gracias por confiar en Pomelo Baby. Ya puedes descargar ', { strong: guia.title }, '.']],
          button: { label: downloadLabel, href: downloadURL.toString() },
          afterButton: [
            `El enlace estará disponible hasta el ${expirationDate}.`,
            ['Si tienes cualquier problema con la descarga, ', { link: 'escríbeme', href: new URL('/contacto', siteURL).toString() }, ' y lo solucionamos.'],
          ],
        }),
      },
      { idempotencyKey: `guia-${session.id}` },
    );

    if (error || !data) {
      console.error('Guide email delivery error:', eventReference(event), error?.name ?? 'UnknownError');
      return new Response('No se pudo enviar la guía', { status: 500 });
    }

    const surveyEmailId = await scheduleSatisfactionSurvey(resend, {
      from: sender,
      to: customerEmail,
      siteUrl: siteURL,
      sessionId: session.id,
      paidAt: event.created,
      product: 'guia',
      productName: guia.title,
      reference: eventReference(event),
    });

    await stripe.checkout.sessions.update(session.id, {
      metadata: {
        type: 'guia',
        guiaId: guia.id,
        priceId: purchasedPriceId,
        blobKey: purchasedBlobKey,
        deliveryEmailId: data.id,
        deliveredAt: new Date().toISOString(),
        downloadExpiresAt: String(expiresAt),
        ...(surveyEmailId ? { encuestaEmailId: surveyEmailId } : {}),
      },
    });
  } catch (error: unknown) {
    console.error('Guide delivery error:', eventReference(event), error instanceof Error ? error.name : 'UnknownError');
    return new Response('No se pudo entregar la guía', { status: 500 });
  }

  return new Response('OK', { status: 200 });
};
