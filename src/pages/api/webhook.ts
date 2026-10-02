import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import Stripe from 'stripe';
import { authorizeGuidePurchase, getStripeMode, guias } from '../../data/guias';
import { getGuideDownloadExpiresAt } from '../../lib/guide-delivery';
import { isPrivateGuidePdfAvailable } from '../../lib/guide-storage';

export const prerender = false;

const eventReference = (event: Stripe.Event) => event.id.slice(-8);

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

  if (
    event.type !== 'checkout.session.completed' &&
    event.type !== 'checkout.session.async_payment_succeeded'
  ) {
    return new Response('OK', { status: 200 });
  }

  const eventSession = event.data.object as Stripe.Checkout.Session;
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
  const siteURL = process.env.SITE_URL;

  if (!resendKey || !sender || !siteURL) {
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
        text: `Hola,\n\nGracias por confiar en Pomelo Baby. Ya puedes descargar «${guia.title}»:\n${downloadURL.toString()}\n\nEl enlace estará disponible hasta el ${expirationDate}.\n\nSi tienes cualquier problema con la descarga, escríbeme desde la página de contacto y lo solucionamos.\n\nMar · Pomelo Baby`,
        html: `
          <p>Hola,</p>
          <p>Gracias por confiar en Pomelo Baby. Ya puedes descargar <strong>${guia.title}</strong>.</p>
          <p><a href="${downloadURL.toString()}">${downloadLabel}</a></p>
          <p>El enlace estará disponible hasta el ${expirationDate}.</p>
          <p>Si tienes cualquier problema con la descarga, <a href="${new URL('/contacto', siteURL).toString()}">escríbeme</a> y lo solucionamos.</p>
          <p>Mar · Pomelo Baby</p>
        `,
      },
      { idempotencyKey: `guia-${session.id}` },
    );

    if (error || !data) {
      console.error('Guide email delivery error:', eventReference(event), error?.name ?? 'UnknownError');
      return new Response('No se pudo enviar la guía', { status: 500 });
    }

    await stripe.checkout.sessions.update(session.id, {
      metadata: {
        type: 'guia',
        guiaId: guia.id,
        priceId: purchasedPriceId,
        blobKey: purchasedBlobKey,
        deliveryEmailId: data.id,
        deliveredAt: new Date().toISOString(),
        downloadExpiresAt: String(expiresAt),
      },
    });
  } catch (error: unknown) {
    console.error('Guide delivery error:', eventReference(event), error instanceof Error ? error.name : 'UnknownError');
    return new Response('No se pudo entregar la guía', { status: 500 });
  }

  return new Response('OK', { status: 200 });
};
