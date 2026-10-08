import { getStripeMode } from '../data/guide-logic.mjs';

export const CONSULTATION_PAYMENT_METHOD_TYPES = ['card'];

export const getConsultationStripeMode = (key, appEnvironment) =>
  getStripeMode(key, appEnvironment);

export const isStripeSessionMode = (livemode, mode) =>
  Boolean(mode) && livemode === (mode === 'live');

export const isPaidConsultationSession = (session, mode) =>
  session?.payment_status === 'paid' &&
  session?.metadata?.type === 'consulta-mensaje' &&
  isStripeSessionMode(session?.livemode, mode);

export const isConsultationSubmissionAuthorized = (session, lineItems, mode) => {
  const linePriceId = lineItems?.data?.[0]?.price?.id;
  const snapshotPriceId = session?.metadata?.priceId;

  return isPaidConsultationSession(session, mode) &&
    lineItems?.data?.length === 1 &&
    typeof linePriceId === 'string' && linePriceId.startsWith('price_') &&
    (snapshotPriceId === undefined || linePriceId === snapshotPriceId) &&
    typeof session?.customer_details?.email === 'string' &&
    Boolean(session.customer_details.email.trim());
};

// Live stays closed until a durable, approved store protects paid health data.
export const canCreateConsultationCheckout = (mode) => mode === 'test';

// Un pago abierto reserva su hueco del día hasta que caduca. 30 minutos es el mínimo de
// Stripe; se deja un minuto de margen para que Stripe no lo rechace por el reloj.
export const CONSULTATION_CHECKOUT_TTL_SECONDS = 31 * 60;

const MADRID_TIME_ZONE = 'Europe/Madrid';

const getMadridOffsetMinutes = (date) => {
  const offset = new Intl.DateTimeFormat('en-US', { timeZone: MADRID_TIME_ZONE, timeZoneName: 'longOffset' })
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value;
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(offset ?? '');
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === '-' ? -minutes : minutes;
};

// Inicio del día de hoy en Madrid, en segundos Unix. El cambio de hora es de madrugada,
// así que el desfase a medianoche es el del propio día.
export const getMadridDayStart = (now = new Date()) => {
  const [year, month, day] = new Intl.DateTimeFormat('en-CA', {
    timeZone: MADRID_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now).split('-').map(Number);
  const utcMidnight = Date.UTC(year, month - 1, day);
  return Math.floor((utcMidnight - getMadridOffsetMinutes(new Date(utcMidnight)) * 60_000) / 1000);
};

// Ocupa hueco una consulta pagada o un pago todavía abierto del mismo entorno.
export const takesDailyConsultationSlot = (session, mode, nowSeconds) =>
  session?.metadata?.type === 'consulta-mensaje' &&
  isStripeSessionMode(session?.livemode, mode) &&
  (session.payment_status === 'paid' ||
    (session.status === 'open' && typeof session.expires_at === 'number' && session.expires_at > nowSeconds));

export const countDailyConsultations = (sessions, mode, nowSeconds) =>
  sessions.filter((session) => takesDailyConsultationSlot(session, mode, nowSeconds)).length;

// Requiere la sesión con payment_intent.latest_charge expandido.
export const isRefundedConsultation = (session) => {
  const paymentIntent = session?.payment_intent;
  const charge = paymentIntent && typeof paymentIntent === 'object' ? paymentIntent.latest_charge : undefined;
  return Boolean(charge && typeof charge === 'object' && (charge.refunded || charge.amount_refunded > 0));
};

export const getConsultationReference = (sessionId) =>
  `PB-${String(sessionId).slice(-6).toUpperCase()}`;
