import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import Stripe from 'stripe';
import { guias, isGuiaPurchasable } from '../../data/guias';
import {
  getGuideDownloadExpiresAt,
  isPrivateGuidePdfAvailable,
} from '../../lib/guide-delivery';

export const prerender = false;

const eventReference = (event: Stripe.Event) => event.id.slice(-8);

export const POST: APIRoute = async ({ request }) => {
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
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
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
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

  if (session.payment_status !== 'paid') {
    return new Response('OK', { status: 200 });
  }

  if (session.metadata?.deliveryEmailId) {
    return new Response('OK', { status: 200 });
  }

  const guiaId = session.metadata?.guiaId;
  const guia = guias.find((item) => item.id === guiaId);
  const customerEmail = session.customer_details?.email;

  if (!guia || !isGuiaPurchasable(guia) || !customerEmail) {
    console.error('Guide delivery data error:', eventReference(event));
    return new Response('La compra no se puede entregar', { status: 500 });
  }

  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 2 });
    if (
      lineItems.data.length !== 1 ||
      lineItems.data[0]?.price?.id !== guia.stripePriceId
    ) {
      console.error('Guide purchase mismatch:', eventReference(event));
      return new Response('La compra no coincide con la guía', { status: 500 });
    }
  } catch (error: unknown) {
    console.error('Guide purchase verification error:', eventReference(event), error instanceof Error ? error.name : 'UnknownError');
    return new Response('No se pudo verificar el producto', { status: 500 });
  }

  const resendKey = import.meta.env.RESEND_API_KEY;
  const sender = import.meta.env.RESEND_FROM_EMAIL;
  const siteURL = import.meta.env.SITE_URL;

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
    if (!await isPrivateGuidePdfAvailable(guia.blobKey)) {
      console.error('Guide PDF configuration error:', eventReference(event));
      return new Response('La guía no está disponible', { status: 500 });
    }

    const expiresAt = getGuideDownloadExpiresAt(session.created);
    const expirationDate = new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'long',
      timeZone: 'Europe/Madrid',
    }).format(new Date(expiresAt * 1000));
    const resend = new Resend(resendKey);
    const { data, error } = await resend.emails.send(
      {
        from: sender,
        to: customerEmail,
        subject: `Tu guía «${guia.title}» ya está lista`,
        text: `Hola,\n\nGracias por confiar en pomelo.bby. Ya puedes descargar «${guia.title}»:\n${downloadURL.toString()}\n\nEl enlace estará disponible hasta el ${expirationDate}.\n\nSi tienes cualquier problema con la descarga, escríbeme desde la página de contacto y lo solucionamos.\n\nMar · pomelo.bby`,
        html: `
          <p>Hola,</p>
          <p>Gracias por confiar en pomelo.bby. Ya puedes descargar <strong>${guia.title}</strong>.</p>
          <p><a href="${downloadURL.toString()}">Descargar mi guía</a></p>
          <p>El enlace estará disponible hasta el ${expirationDate}.</p>
          <p>Si tienes cualquier problema con la descarga, <a href="${new URL('/contacto', siteURL).toString()}">escríbeme</a> y lo solucionamos.</p>
          <p>Mar · pomelo.bby</p>
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
