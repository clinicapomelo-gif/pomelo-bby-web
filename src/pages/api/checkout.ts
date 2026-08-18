import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { guias, isGuiaPurchasable } from '../../data/guias';

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

  if (guia.status === 'coming-soon') {
    return Response.json({ error: 'Esta guía estará disponible próximamente.' }, { status: 409 });
  }

  if (!isGuiaPurchasable(guia)) {
    return Response.json(
      { error: 'La guía no tiene un precio de Stripe y un PDF válidos.' },
      { status: 503 },
    );
  }

  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey === 'sk_test_PLACEHOLDER') {
    return Response.json({ error: 'Stripe no está configurado todavía.' }, { status: 503 });
  }

  const stripe = new Stripe(stripeKey);
  const siteURL = import.meta.env.SITE_URL ?? 'https://pomelo-bby-web.vercel.app';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: guia.stripePriceId, quantity: 1 }],
      success_url: `${siteURL}/tienda/gracias?session_id={CHECKOUT_SESSION_ID}&guia=${guiaId}`,
      cancel_url: `${siteURL}/tienda/${guiaId}`,
      metadata: { guiaId },
      automatic_tax: { enabled: false },
    });

    if (!session.url) {
      return Response.json({ error: 'No se pudo crear la sesión de pago.' }, { status: 500 });
    }

    return Response.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error instanceof Error ? error.message : 'Error desconocido');
    return Response.json({ error: 'No se pudo iniciar el pago. Inténtalo de nuevo.' }, { status: 500 });
  }
};
