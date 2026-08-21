import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONSULTATION_PAYMENT_METHOD_TYPES,
  canCreateConsultationCheckout,
  getConsultationStripeMode,
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
