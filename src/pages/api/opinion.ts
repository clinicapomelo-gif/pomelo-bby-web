import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { getDiscoveryAnswer } from '../../lib/checkout-discovery';
import { getConsultationReference } from '../../lib/consulta-payment.mjs';
import { VALORACIONES, parseNota } from '../../lib/encuesta.mjs';
import { isValidSessionId, loadOpinionPurchase } from '../../lib/opinion';

export const prerender = false;

const COMENTARIO_MAX = 1000;

// Formulario sin JavaScript: los errores vuelven a /opinion con un aviso.
export const POST: APIRoute = async ({ request, redirect }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return redirect('/', 303);
  }

  const sessionId = form.get('session_id');
  if (!isValidSessionId(sessionId)) return redirect('/', 303);

  const nota = parseNota(form.get('nota'));
  const comentario = String(form.get('comentario') ?? '').trim();
  const compartir = form.get('compartir') === 'si';
  const back = (error: boolean) => {
    const url = new URL('/opinion', request.url);
    url.searchParams.set('session_id', sessionId);
    if (nota) url.searchParams.set('nota', String(nota));
    if (error) url.searchParams.set('error', '1');
    return redirect(`${url.pathname}${url.search}`, 303);
  };

  if (!nota || comentario.length > COMENTARIO_MAX) return back(true);

  let purchase;
  try {
    purchase = await loadOpinionPurchase(sessionId);
  } catch (error: unknown) {
    console.error('Opinion purchase check error:', error instanceof Error ? error.name : 'UnknownError');
    return back(true);
  }
  // Enlace que ya no vale: /opinion muestra el aviso.
  if (!purchase) return back(false);
  if (purchase.answered) return redirect('/opinion/gracias', 303);

  // Las opiniones de la consulta pueden traer datos de salud: van al buzón de las consultas.
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = purchase.product === 'consulta' ? process.env.RESEND_CONSULTA_TO_EMAIL : process.env.RESEND_TO_EMAIL;
  if (!resendKey || !from || !to) return back(true);

  const { session, paymentIntent, product, productName } = purchase;
  const customerEmail = session.customer_details?.email?.trim();
  const valoracion = VALORACIONES.find((item) => item.nota === nota)!;

  try {
    const { error } = await new Resend(resendKey).emails.send({
      from,
      to,
      ...(customerEmail ? { replyTo: customerEmail } : {}),
      subject: `Opinión «${valoracion.texto}»: ${productName} — Pomelo Baby`,
      text: [
        `Nueva opinión de ${product === 'guia' ? 'una guía' : 'la consulta por correo'}.`,
        '',
        `${product === 'guia' ? 'Guía' : 'Consulta'}: ${productName}${product === 'consulta' ? ` (${getConsultationReference(session.id)})` : ''}`,
        `¿Le está sirviendo?: ${valoracion.texto}`,
        `¿Se puede compartir, sin nombre?: ${compartir ? 'Sí' : 'No'}`,
        `Nos conoció por: ${getDiscoveryAnswer(session) ?? 'no lo indicó'}`,
        `Email: ${customerEmail ?? 'no disponible'}`,
        '',
        comentario ? `Comentario:\n${comentario}` : 'Sin comentario.',
        '',
        'Si respondes a este correo, le escribes directamente.',
      ].join('\n'),
    }, { idempotencyKey: `opinion-${session.id}` });
    if (error) {
      console.error('Opinion email error:', error.name);
      return back(true);
    }
  } catch (error: unknown) {
    console.error('Opinion email exception:', error instanceof Error ? error.name : 'UnknownError');
    return back(true);
  }

  // En el PaymentIntent, no en la sesión: así sale en el pago y en la exportación de Pagos.
  // El comentario no se guarda en Stripe; solo llega por correo.
  try {
    await purchase.stripe.paymentIntents.update(paymentIntent.id, {
      metadata: {
        opinion: valoracion.texto,
        opinionCompartir: compartir ? 'si' : 'no',
        opinionAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error('Opinion metadata error:', error instanceof Error ? error.name : 'UnknownError');
  }

  return redirect('/opinion/gracias', 303);
};
