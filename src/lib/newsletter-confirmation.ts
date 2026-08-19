import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export type NewsletterConfirmation = {
  email: string;
  name: string;
  source: 'newsletter' | 'lead_magnet_25_cosas';
  consentVersion: string;
  consentedAt: string;
  expiresAt: number;
};

const keyFrom = (secret: string) => {
  const key = Buffer.from(secret, 'base64');
  if (key.length !== 32) throw new Error('Invalid newsletter confirmation secret');
  return key;
};

export const encryptNewsletterConfirmation = (payload: NewsletterConfirmation, secret: string) => {
  // ponytail: el token cifrado evita guardar altas pendientes; persistir solo si lo exige la operativa legal.
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keyFrom(secret), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);

  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
};

export const decryptNewsletterConfirmation = (token: string, secret: string): NewsletterConfirmation => {
  const value = Buffer.from(token, 'base64url');
  if (value.length <= 28) throw new Error('Invalid newsletter confirmation token');

  const decipher = createDecipheriv('aes-256-gcm', keyFrom(secret), value.subarray(0, 12));
  decipher.setAuthTag(value.subarray(12, 28));
  const payload: unknown = JSON.parse(Buffer.concat([
    decipher.update(value.subarray(28)),
    decipher.final(),
  ]).toString('utf8'));

  if (
    !payload || typeof payload !== 'object' ||
    !('email' in payload) || typeof payload.email !== 'string' || payload.email.length > 254 ||
    !('name' in payload) || typeof payload.name !== 'string' || !payload.name || payload.name.length > 100 ||
    !('source' in payload) || !['newsletter', 'lead_magnet_25_cosas'].includes(String(payload.source)) ||
    !('consentVersion' in payload) || typeof payload.consentVersion !== 'string' ||
    !('consentedAt' in payload) || typeof payload.consentedAt !== 'string' ||
    !('expiresAt' in payload) || typeof payload.expiresAt !== 'number' || payload.expiresAt < Date.now()
  ) {
    throw new Error('Invalid newsletter confirmation payload');
  }

  return payload as NewsletterConfirmation;
};
