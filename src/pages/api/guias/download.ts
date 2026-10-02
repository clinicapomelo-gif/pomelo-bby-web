import type { APIRoute } from 'astro';
import { get } from '@vercel/blob';
import Stripe from 'stripe';
import { authorizeGuidePurchase, getStripeMode, guias } from '../../../data/guias';
import { getGuideDownloadExpiresAt } from '../../../lib/guide-delivery';

export const prerender = false;

const errorType = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'type' in error) {
    return String(error.type);
  }

  return error instanceof Error ? error.name : 'UnknownError';
};

const textResponse = (message: string, status: number) => new Response(message, {
  status,
  headers: {
    'Cache-Control': 'private, no-store',
    'Content-Type': 'text/plain; charset=utf-8',
  },
});

const unavailable = () => textResponse(
  'No hemos podido verificar este enlace. Si necesitas ayuda, escríbenos desde la página de contacto.',
  404,
);

const temporarilyUnavailable = () => textResponse(
  'La descarga no está disponible temporalmente.',
  503,
);

export const GET: APIRoute = async ({ url }) => {
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId?.startsWith('cs_') || sessionId.length > 255) {
    return unavailable();
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripeMode = getStripeMode(stripeKey);
  if (!stripeKey || !stripeMode) {
    return temporarilyUnavailable();
  }

  const stripe = new Stripe(stripeKey);
  let session: Stripe.Checkout.Session;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error: unknown) {
    const type = errorType(error);
    console.error('Guide download verification error:', type);
    return type === 'StripeInvalidRequestError' ? unavailable() : temporarilyUnavailable();
  }

  const guia = guias.find((item) => item.id === session.metadata?.guiaId);

  if (
    session.payment_status !== 'paid' ||
    session.livemode !== (stripeMode === 'live') ||
    session.metadata?.type !== 'guia' ||
    !guia
  ) {
    return unavailable();
  }

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

    if (lineItems.data.length !== 1 || !authorizedBlobKey) return unavailable();
    purchasedBlobKey = authorizedBlobKey;
  } catch (error: unknown) {
    console.error('Guide download line verification error:', errorType(error));
    return temporarilyUnavailable();
  }

  const expiresAt = getGuideDownloadExpiresAt(
    session.created,
    session.metadata?.downloadExpiresAt,
  );

  if (Math.floor(Date.now() / 1000) > expiresAt) {
    return textResponse(
      'Este enlace ha caducado. Escríbenos desde la página de contacto y comprobaremos tu compra.',
      410,
    );
  }

  try {
    // La SDK resuelve OIDC o BLOB_READ_WRITE_TOKEN en runtime.
    const result = await get(purchasedBlobKey, { access: 'private' });

    if (!result || result.statusCode !== 200 || result.blob.contentType !== 'application/pdf') {
      return temporarilyUnavailable();
    }

    return new Response(result.stream, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
        'Content-Disposition': `attachment; filename="${guia.id}.pdf"`,
        'Content-Length': String(result.blob.size),
        'Content-Type': 'application/pdf',
      },
    });
  } catch (error: unknown) {
    console.error('Guide Blob download error:', errorType(error));
    return temporarilyUnavailable();
  }
};
