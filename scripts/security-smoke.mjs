// Pruebas de seguridad de caja negra contra un Worker en marcha (por defecto, `astro preview`
// en local). Todas comprueban que la web se cierra ante datos manipulados; ninguna compra,
// envía correos ni escribe nada. Uso:
//   npm run build && npx astro preview --port 4323
//   BASE_URL=http://localhost:4323 npm run test:security
// Necesita en .dev.vars valores de Sandbox (o falsos con el mismo formato): STRIPE_SECRET_KEY=sk_test_…,
// STRIPE_WEBHOOK_SECRET=whsec_…, RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_CONSULTA_TO_EMAIL,
// RESEND_NEWSLETTER_SEGMENT_ID, RESEND_NEWSLETTER_TOPIC_ID y NEWSLETTER_CONFIRMATION_SECRET.
// Nunca claves Live.
import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = (process.env.BASE_URL ?? 'http://localhost:4323').replace(/\/$/, '');
const EVIL_ORIGIN = 'https://evil.example';

const request = (path, init = {}) => fetch(`${BASE_URL}${path}`, { redirect: 'manual', ...init });
const location = (response) => response.headers.get('location') ?? '';
const json = (body, headers = {}) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify(body),
});

test('las respuestas del Worker llevan las cabeceras de seguridad', async () => {
  const response = await request('/api/guias/gratis?id=no-existe');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.match(response.headers.get('strict-transport-security') ?? '', /max-age=\d+/);
});

test('descarga: un session_id inventado, de otro modo o manipulado no da el PDF', async () => {
  for (const id of ['', 'x', 'cs_live_inventado', '../../etc/passwd', 'cs_test_<script>', `cs_test_${'a'.repeat(300)}`]) {
    const response = await request(`/api/guias/download?session_id=${encodeURIComponent(id)}`);
    assert.equal(response.status, 303, id);
    assert.match(location(response), /\/guias\/enlace\?motivo=(no-valido|temporal)$/, id);
    assert.notEqual(response.headers.get('content-type'), 'application/pdf', id);
  }
});

test('guía gratis: una guía de pago o una ruta manipulada no se descarga', async () => {
  for (const id of ['sueno-infantil', 'atragantamiento-bebes-ninos', '../guias', '']) {
    const response = await request(`/api/guias/gratis?id=${encodeURIComponent(id)}`);
    assert.equal(response.status, 404, id);
    assert.notEqual(response.headers.get('content-type'), 'application/pdf', id);
  }
});

test('checkout: solo productos del catálogo; precio e importe del cliente se ignoran', async () => {
  const unknown = await request('/api/checkout', json({ guiaId: '../../admin', price: 1 }));
  assert.equal(unknown.status, 404);
  const malformed = await request('/api/checkout', json({ guiaId: { $ne: null } }));
  assert.equal(malformed.status, 400);
  const free = await request('/api/checkout', json({ guiaId: 'conservacion-leche-materna' }));
  assert.equal(free.status, 400);
});

test('webhook: sin firma o con firma falsa se rechaza', async () => {
  const event = JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: 'cs_test_x', metadata: { type: 'guia' } } } });
  // Con JSON, como lo envía Stripe (un formulario lo frenaría antes la protección CSRF de Astro).
  const headers = { 'Content-Type': 'application/json; charset=utf-8' };
  const unsigned = await request('/api/webhook', { method: 'POST', body: event, headers });
  assert.equal(unsigned.status, 400);
  const forged = await request('/api/webhook', {
    method: 'POST',
    body: event,
    headers: { ...headers, 'stripe-signature': `t=${Math.floor(Date.now() / 1000)},v1=${'0'.repeat(64)}` },
  });
  assert.equal(forged.status, 400);
});

test('consulta: el formulario no acepta un pago inventado ni de otro modo', async () => {
  for (const sessionId of ['cs_live_inventado', 'x', '']) {
    const response = await request('/api/consulta-mensaje', json({
      session_id: sessionId, nombre: 'Ana', edad: '3 meses', motivo: 'Prueba',
    }));
    assert.equal(response.status, 403, sessionId);
  }
});

test('páginas de gracias: un session_id inválido no se refleja ni consulta datos', async () => {
  const payload = 'cs_live_"><script>alert(1)</script>';
  const guia = await request(`/guias/gracias?session_id=${encodeURIComponent(payload)}`);
  const body = await guia.text();
  assert.equal(body.includes('<script>alert(1)</script>'), false);
  assert.match(guia.headers.get('cache-control') ?? '', /no-store/);
  assert.equal(guia.headers.get('referrer-policy'), 'no-referrer');

  const consulta = await request(`/consulta-mensaje/gracias?session_id=${encodeURIComponent(payload)}`);
  assert.equal(consulta.status, 302);
  assert.match(location(consulta), /\/consultas$/);
});

test('formularios: rechazan peticiones de otro origen (CSRF)', async () => {
  const subscribe = await request('/api/subscribe', json(
    { email: 'ana@example.com', nombre: 'Ana', privacy: 'on' },
    { Origin: EVIL_ORIGIN },
  ));
  assert.ok([403, 503].includes(subscribe.status), String(subscribe.status));
  const contact = await request('/api/contact', json(
    { nombre: 'Ana', email: 'ana@example.com', motivo: 'otro', mensaje: 'Hola' },
    { Origin: EVIL_ORIGIN },
  ));
  assert.equal(contact.status, 403);
});

test('El Chisme: un token de confirmación manipulado no da de alta a nadie', async () => {
  for (const token of ['', 'abc', 'A'.repeat(200), '{"email":"ana@example.com"}']) {
    const response = await request('/api/chisme/confirm', json({ token }));
    assert.equal(response.status, 303, token);
    assert.match(location(response), /error=(invalid|temporary)|\/chisme$/, token);
  }
});
