import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONSULTATION_PAYMENT_METHOD_TYPES,
  canCreateConsultationCheckout,
  countDailyConsultations,
  getConsultationReference,
  getConsultationStripeMode,
  getMadridDayStart,
  isRefundedConsultation,
  isConsultationSubmissionAuthorized,
  isPaidConsultationSession,
  isStripeSessionMode,
} from '../src/lib/consulta-payment.mjs';

const session = (overrides = {}) => ({
  payment_status: 'paid',
  livemode: false,
  metadata: { type: 'consulta-mensaje' },
  customer_details: { email: 'familia@example.com' },
  ...overrides,
});

const lineItems = (priceId = 'price_consulta123') => ({
  data: [{ price: { id: priceId } }],
});

test('solo acepta credenciales Stripe propias del entorno', () => {
  assert.equal(getConsultationStripeMode('sk_test_example', 'development'), 'test');
  assert.equal(getConsultationStripeMode('sk_test_example', 'preview'), 'test');
  assert.equal(getConsultationStripeMode('sk_live_example', 'production'), 'live');
  assert.equal(getConsultationStripeMode('sk_test_example', 'production'), undefined);
  assert.equal(getConsultationStripeMode('sk_live_example', 'preview'), undefined);
  assert.equal(getConsultationStripeMode('sk_live_example', 'development'), undefined);
  assert.equal(getConsultationStripeMode('sk_test_PLACEHOLDER', 'preview'), undefined);
  assert.equal(getConsultationStripeMode('anything', 'preview'), undefined);
});

test('compara livemode con el modo resuelto', () => {
  assert.equal(isStripeSessionMode(false, 'test'), true);
  assert.equal(isStripeSessionMode(true, 'live'), true);
  assert.equal(isStripeSessionMode(true, 'test'), false);
  assert.equal(isStripeSessionMode(false, 'live'), false);
  assert.equal(isStripeSessionMode(false, undefined), false);
});

test('autoriza la página del formulario solo para un pago del entorno correcto', () => {
  assert.equal(isPaidConsultationSession(session(), 'test'), true);
  assert.equal(isPaidConsultationSession(session({ livemode: true }), 'test'), false);
  assert.equal(isPaidConsultationSession(session({ payment_status: 'unpaid' }), 'test'), false);
  assert.equal(isPaidConsultationSession(session({ metadata: { type: 'guia' } }), 'test'), false);
});

test('autoriza el envío solo con pago, Price, email y entorno coincidentes', () => {
  const valid = session();
  assert.equal(isConsultationSubmissionAuthorized(valid, lineItems(), 'test'), true);
  assert.equal(isConsultationSubmissionAuthorized({ ...valid, livemode: true }, lineItems(), 'test'), false);

  const historical = session({ metadata: { type: 'consulta-mensaje', priceId: 'price_historical123' } });
  assert.equal(isConsultationSubmissionAuthorized(historical, lineItems('price_historical123'), 'test'), true);
  assert.equal(isConsultationSubmissionAuthorized(historical, lineItems('price_other123'), 'test'), false);

  const legacy = session();
  assert.equal(isConsultationSubmissionAuthorized(legacy, lineItems('price_retired123'), 'test'), true);

  assert.equal(isConsultationSubmissionAuthorized(valid, { data: [] }, 'test'), false);
  assert.equal(isConsultationSubmissionAuthorized(valid, lineItems('product_not_a_price'), 'test'), false);
  assert.equal(isConsultationSubmissionAuthorized({ ...valid, customer_details: {} }, lineItems(), 'test'), false);
});

test('limita el checkout a pagos de tarjeta confirmados al volver', () => {
  assert.deepEqual(CONSULTATION_PAYMENT_METHOD_TYPES, ['card']);
});

test('mantiene el checkout live cerrado hasta disponer de persistencia duradera', () => {
  assert.equal(canCreateConsultationCheckout('test'), true);
  assert.equal(canCreateConsultationCheckout('live'), false);
  assert.equal(canCreateConsultationCheckout(undefined), false);
});

test('el día empieza a medianoche de Madrid, también con cambio de hora', () => {
  const seconds = (iso) => Date.parse(iso) / 1000;
  // Verano (UTC+2): la medianoche del 7 oct es el 6 oct a las 22:00 UTC.
  assert.equal(getMadridDayStart(new Date('2026-10-07T10:00:00Z')), seconds('2026-10-06T22:00:00Z'));
  assert.equal(getMadridDayStart(new Date('2026-10-06T22:30:00Z')), seconds('2026-10-06T22:00:00Z'));
  assert.equal(getMadridDayStart(new Date('2026-10-06T21:30:00Z')), seconds('2026-10-05T22:00:00Z'));
  // Invierno (UTC+1).
  assert.equal(getMadridDayStart(new Date('2026-12-01T12:00:00Z')), seconds('2026-11-30T23:00:00Z'));
  // Días de cambio de hora: la medianoche aún tiene el desfase anterior.
  assert.equal(getMadridDayStart(new Date('2026-03-29T12:00:00Z')), seconds('2026-03-28T23:00:00Z'));
  assert.equal(getMadridDayStart(new Date('2026-10-25T12:00:00Z')), seconds('2026-10-24T22:00:00Z'));
});

test('cuentan las consultas pagadas y los pagos abiertos del entorno', () => {
  const now = 1_000_000;
  const sessions = [
    session(),
    session({ status: 'open', payment_status: 'unpaid', expires_at: now + 60 }),
    session({ status: 'expired', payment_status: 'unpaid', expires_at: now - 60 }),
    session({ status: 'open', payment_status: 'unpaid', expires_at: now - 1 }),
    session({ metadata: { type: 'guia' } }),
    session({ livemode: true }),
  ];
  assert.equal(countDailyConsultations(sessions, 'test', now), 2);
  assert.equal(countDailyConsultations([], 'test', now), 0);
});

test('detecta un pago devuelto con la carga expandida', () => {
  const charged = (charge) => session({ payment_intent: { latest_charge: charge } });
  assert.equal(isRefundedConsultation(charged({ refunded: false, amount_refunded: 0 })), false);
  assert.equal(isRefundedConsultation(charged({ refunded: true, amount_refunded: 1900 })), true);
  assert.equal(isRefundedConsultation(charged({ refunded: false, amount_refunded: 500 })), true);
  assert.equal(isRefundedConsultation(session({ payment_intent: 'pi_123' })), false);
  assert.equal(isRefundedConsultation(session()), false);
});

test('la referencia usa el final del identificador de la sesión', () => {
  assert.equal(getConsultationReference('cs_test_a1b2c3d4e5f6'), 'PB-D4E5F6');
});
