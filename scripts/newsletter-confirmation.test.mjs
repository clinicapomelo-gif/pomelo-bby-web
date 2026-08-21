import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import {
  decryptNewsletterConfirmation,
  encryptNewsletterConfirmation,
} from '../src/lib/newsletter-confirmation.ts';
import { getGuideDownloadExpiresAt } from '../src/lib/guide-delivery.ts';

const secret = randomBytes(32).toString('base64');
const payload = (overrides = {}) => ({
  email: 'familia@example.com',
  name: 'Familia',
  source: 'newsletter',
  consentVersion: 'newsletter_v1',
  consentedAt: new Date().toISOString(),
  expiresAt: Date.now() + 60_000,
  ...overrides,
});

test('cifra y recupera una confirmación válida', () => {
  const original = payload();
  const token = encryptNewsletterConfirmation(original, secret);

  assert.deepEqual(decryptNewsletterConfirmation(token, secret), original);
  assert.doesNotMatch(token, /familia@example\.com/);
});

test('rechaza tokens manipulados o cifrados con otra clave', () => {
  const token = encryptNewsletterConfirmation(payload(), secret);
  const index = Math.floor(token.length / 2);
  const manipulated = `${token.slice(0, index)}${token[index] === 'A' ? 'B' : 'A'}${token.slice(index + 1)}`;

  assert.throws(() => decryptNewsletterConfirmation(manipulated, secret));
  assert.throws(() => decryptNewsletterConfirmation(token, randomBytes(32).toString('base64')));
});

test('rechaza confirmaciones caducadas o con fecha de consentimiento inválida', () => {
  const expired = encryptNewsletterConfirmation(payload({ expiresAt: Date.now() - 1 }), secret);
  const invalidDate = encryptNewsletterConfirmation(payload({ consentedAt: 'fecha-inválida' }), secret);

  assert.throws(() => decryptNewsletterConfirmation(expired, secret));
  assert.throws(() => decryptNewsletterConfirmation(invalidDate, secret));
});

test('calcula la caducidad de descarga desde la compra salvo una ampliación válida', () => {
  const created = 1_700_000_000;
  const defaultExpiry = created + 30 * 24 * 60 * 60;

  assert.equal(getGuideDownloadExpiresAt(created), defaultExpiry);
  assert.equal(getGuideDownloadExpiresAt(created, String(defaultExpiry + 60)), defaultExpiry + 60);
  assert.equal(getGuideDownloadExpiresAt(created, String(created + 60)), defaultExpiry);
  assert.equal(getGuideDownloadExpiresAt(created, String(created)), defaultExpiry);
  assert.equal(getGuideDownloadExpiresAt(created, 'no-es-fecha'), defaultExpiry);
});
