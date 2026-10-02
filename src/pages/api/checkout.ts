import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import {
  getGuiaStripeMapping,
  getStripeMode,
  guias,
  isGuiaPurchasable,
} from '../../data/guias';
import { termsConsent } from '../../lib/checkout-consent';
import { isPrivateGuidePdfAvailable } from '../../lib/guide-delivery';
import { getSiteUrl } from '../../lib/site-url';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let guiaId: unknown;

  try {
    if (request.headers.get('content-type')?.includes('application/json')) {
      const body: unknown = await request.json();
      guiaId = typeof body === 'object' && body !== null && 'guiaId' in body
        ? body.guiaId
        : undefined;
    } else {
      guiaId = (await request.formData()).get('guiaId');
    }
  } catch {
    return Response.json({ error: 'La solicitud no es válida.' }, { status: 400 });
  }

  if (typeof guiaId !== 'string' || !guiaId.trim()) {
    return Response.json({ error: 'Falta el ID del producto.' }, { status: 400 });
  }

  const guia = guias.find((item) => item.id === guiaId);
  if (!guia) {
    return Response.json({ error: 'Producto no encontrado.' }, { status: 404 });
  }

  if (guia.status === 'free') {
    return Response.json({ error: 'Los recursos gratuitos no pasan por el checkout.' }, { status: 400 });
  }

  if (guia.status === 'coming-soon' || guia.status === 'archived') {
    return Response.json({ error: 'Esta guía no está disponible para nuevas compras.' }, { status: 409 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripeMode = getStripeMode(stripeKey);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const resendKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_FROM_EMAIL;
  const configuredSiteURL = process.env.SITE_URL;

  if (
    !stripeKey || !stripeMode ||
    !webhookSecret?.startsWith('whsec_') || !resendKey || !sender ||
    (process.env.APP_ENV === 'production' && !configuredSiteURL)
  ) {
    return Response.json({ error: 'La compra no está configurada todavía.' }, { status: 503 });
  }

  if (guia.status === 'testing' && stripeMode === 'live') {
    return Response.json({ error: 'Esta guía solo está disponible en pruebas.' }, { status: 409 });
  }

  if (!isGuiaPurchasable(guia, stripeMode)) {
    return Response.json(
      { error: 'La guía no tiene un precio de Stripe y un PDF válidos para este entorno.' },
      { status: 503 },
    );
  }

  const stripeMapping = getGuiaStripeMapping(guia, stripeMode);
  if (!stripeMapping) {
    return Response.json({ error: 'La compra no está configurada todavía.' }, { status: 503 });
  }

  const siteURL = getSiteUrl(request);
  try {
    new URL(siteURL);
  } catch {
    return Response.json({ error: 'La compra no está configurada todavía.' }, { status: 503 });
  }

  try {
    if (!await isPrivateGuidePdfAvailable(guia.blobKey)) {
      return Response.json({ error: 'El PDF de esta guía no está disponible.' }, { status: 503 });
    }
  } catch (error: unknown) {
    console.error('Guide PDF verification error:', error instanceof Error ? error.name : 'UnknownError');
    return Response.json({ error: 'El PDF de esta guía no está disponible.' }, { status: 503 });
  }

  const stripe = new Stripe(stripeKey);
  const baseURL = siteURL.replace(/\/$/, '');
  const purchaseMetadata = {
    type: 'guia',
    guiaId: guia.id,
    priceId: stripeMapping.priceId,
    blobKey: guia.blobKey,
  };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: stripeMapping.priceId, quantity: 1 }],
      success_url: `${baseURL}/guias/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseURL}/guias/${guiaId}`,
      metadata: purchaseMetadata,
      payment_intent_data: { metadata: purchaseMetadata },
      automatic_tax: { enabled: false },
      adaptive_pricing: { enabled: false },
      locale: 'es',
      ...termsConsent(baseURL, 'guia'),
    });

    if (!session.url) {
      return Response.json({ error: 'No se pudo crear la sesión de pago.' }, { status: 500 });
    }

    return Response.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error instanceof Error ? error.name : 'UnknownError');
    return Response.json({ error: 'No se pudo iniciar el pago. Inténtalo de nuevo.' }, { status: 500 });
  }
};
