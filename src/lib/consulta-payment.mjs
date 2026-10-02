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
