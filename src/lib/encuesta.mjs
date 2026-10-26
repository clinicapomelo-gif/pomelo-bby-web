// Encuesta de satisfacción: un solo correo, una semana después de la compra a las 10:00
// de Madrid, programado en Resend desde el webhook. Sin recordatorios. Cada respuesta del
// correo abre /opinion con ella marcada; se guarda al pulsar «Enviar mi opinión».
// Solo se programa con el pago confirmado. Si se devuelve el dinero, el webhook
// (`charge.refunded`) la cancela con el id guardado en la metadata `encuestaEmailId`.
import { renderEmail } from './email-template.mjs';

export const ENCUESTA_ACTIVA = true;
export const ENCUESTA_DIAS = 7;
// Pasado este plazo desde la compra, el enlace de la encuesta deja de funcionar.
export const OPINION_MAX_DIAS = 60;
const ENCUESTA_HORA_MADRID = 10;

// Tres respuestas a «¿Te está sirviendo?», de más a menos. Todas con el mismo estilo para
// no empujar hacia ninguna.
export const VALORACIONES = [
  { nota: 3, texto: 'Sí, mucho' },
  { nota: 2, texto: 'Un poco' },
  { nota: 1, texto: 'No mucho' },
];

// Devuelve la nota (1-3) o undefined si el valor no es válido.
export const parseNota = (value) => {
  const nota = Number(value);
  return VALORACIONES.some((valoracion) => valoracion.nota === nota) ? nota : undefined;
};

// Diferencia con UTC de Madrid en ese momento («GMT+01:00» o «GMT+02:00» según el horario).
const madridOffset = (date) => new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Madrid',
  timeZoneName: 'longOffset',
}).formatToParts(date).find((part) => part.type === 'timeZoneName').value.replace('GMT', '') || '+00:00';

// A las 10:00 de Madrid del día que toca, para que no llegue de madrugada.
export const getSurveySendAt = (paidAtSeconds) => {
  const target = new Date((paidAtSeconds + ENCUESTA_DIAS * 24 * 60 * 60) * 1000);
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(target);
  const hour = String(ENCUESTA_HORA_MADRID).padStart(2, '0');
  return new Date(`${day}T${hour}:00:00${madridOffset(target)}`).toISOString();
};

export const getOpinionUrl = (siteUrl, sessionId, nota) => {
  const url = new URL('/opinion', siteUrl);
  url.searchParams.set('session_id', sessionId);
  if (nota) url.searchParams.set('nota', String(nota));
  return url.toString();
};

// La misma pregunta en el asunto del correo y en el título de /opinion. Sin el título de
// la guía: muchos ya son preguntas y quedaría «¿…«¿…?»?».
export const getSurveyQuestion = (product) =>
  product === 'guia' ? '¿Te está sirviendo la guía?' : '¿Te sirvió la consulta?';

/**
 * @param {{ siteUrl: string, sessionId: string, product: 'guia' | 'consulta', productName: string }} content
 */
export const renderSurveyEmail = ({ siteUrl, sessionId, product, productName }) => ({
  subject: getSurveyQuestion(product),
  ...renderEmail({
    siteUrl,
    preheader: 'Toca una respuesta y listo. Me ayuda mucho saberlo.',
    greeting: 'Hola,',
    paragraphs: [
      product === 'guia'
        ? ['Hace una semana te llegó ', { strong: productName }, ' y me encantaría saber qué tal os está yendo con ella.']
        : 'Hace una semana me contaste tu caso por correo. Espero que estéis bien. Me encantaría saber si mi respuesta te sirvió.',
      { strong: product === 'guia' ? '¿Te está sirviendo?' : '¿Te sirvió?' },
    ],
    choices: VALORACIONES.map(({ nota, texto }) => ({
      label: texto,
      href: getOpinionUrl(siteUrl, sessionId, nota),
    })),
    afterButton: [
      'Después, si te apetece, puedes contarme algo más. Si prefieres no responder, no pasa nada.',
      ['Si prefieres que no te escriba para esto, ', { link: 'dímelo aquí', href: new URL('/contacto', siteUrl).toString() }, ' y no lo volveré a hacer.'],
    ],
  }),
});

/**
 * Programa la encuesta. Nunca lanza: la entrega o el aviso ya están hechos y no deben
 * fallar por esto. Devuelve el id del correo programado, o undefined.
 * @param {import('resend').Resend} resend
 * @param {{ from: string, to: string, siteUrl: string, sessionId: string, paidAt: number, product: 'guia' | 'consulta', productName: string, reference: string }} options
 */
export const scheduleSatisfactionSurvey = async (resend, { from, to, siteUrl, sessionId, paidAt, product, productName, reference }) => {
  if (!ENCUESTA_ACTIVA) return undefined;
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      scheduledAt: getSurveySendAt(paidAt),
      ...renderSurveyEmail({ siteUrl, sessionId, product, productName }),
    }, { idempotencyKey: `encuesta-${sessionId}` });
    if (error || !data) {
      console.error('Survey scheduling error:', reference, error?.name ?? 'UnknownError');
      return undefined;
    }
    return data.id;
  } catch (error) {
    console.error('Survey scheduling exception:', reference, error instanceof Error ? error.name : 'UnknownError');
    return undefined;
  }
};
