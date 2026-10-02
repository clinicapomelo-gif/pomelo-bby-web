import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { decryptNewsletterConfirmation } from '../../../lib/newsletter-confirmation';
import { confirmExistingContact } from '../../../lib/resend-contact-confirmation.mjs';

export const prerender = false;

const failure = (request: Request, type = 'invalid') =>
  Response.redirect(new URL(`/chisme/confirm?error=${type}`, request.url), 303);

const success = (request: Request, source: 'newsletter' | 'lead_magnet_25_cosas') =>
  Response.redirect(new URL(
    source === 'lead_magnet_25_cosas'
      ? '/api/recursos/25-cosas-normales-bebes/download'
      : '/chisme/confirmada',
    request.url,
  ), 303);

export const POST: APIRoute = async ({ request }) => {
  let token: string;

  try {
    if (request.headers.get('content-type')?.includes('application/json')) {
      const body: unknown = await request.json();
      token = typeof body === 'object' && body !== null && 'token' in body && typeof body.token === 'string'
        ? body.token
        : '';
    } else {
      const value = (await request.formData()).get('token');
      token = typeof value === 'string' ? value : '';
    }
  } catch {
    return failure(request);
  }

  const secret = process.env.NEWSLETTER_CONFIRMATION_SECRET;
  const resendKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;
  const topicId = process.env.RESEND_NEWSLETTER_TOPIC_ID;
  if (!secret || !resendKey || !segmentId || !topicId) return failure(request, 'temporary');

  let confirmation;
  try {
    confirmation = decryptNewsletterConfirmation(token, secret);
  } catch {
    return failure(request);
  }

  const resend = new Resend(resendKey);

  try {
    const existing = await resend.contacts.get({ email: confirmation.email });
    if (existing.error && existing.error.name !== 'not_found') {
      console.error('Resend confirmation lookup failed', existing.error.name, existing.error.statusCode);
      return failure(request, 'temporary');
    }

    const previousConsent = existing.data?.properties.consented_at;
    const previousConsentAt = previousConsent?.type === 'string'
      ? Date.parse(previousConsent.value)
      : Number.NaN;
    const alreadyConfirmed = Number.isFinite(previousConsentAt) &&
      previousConsentAt >= Date.parse(confirmation.consentedAt);

    if (alreadyConfirmed) return success(request, confirmation.source);

    const properties = {
      signup_source: confirmation.source,
      consent_version: confirmation.consentVersion,
      consented_at: new Date().toISOString(),
    };

    if (!existing.data) {
      const created = await resend.contacts.create({
        email: confirmation.email,
        firstName: confirmation.name,
        unsubscribed: false,
        properties,
        segments: [{ id: segmentId }],
        topics: [{ id: topicId, subscription: 'opt_in' }],
      });

      if (created.error) {
        console.error('Resend confirmed contact creation failed', created.error.name, created.error.statusCode);
        return failure(request, 'temporary');
      }

      return success(request, confirmation.source);
    }

    const confirmed = await confirmExistingContact({
      contacts: resend.contacts,
      email: confirmation.email,
      name: confirmation.name,
      segmentId,
      topicId,
      properties,
    });

    if (!confirmed.ok) {
      console.error(`Resend confirmed ${confirmed.operation} failed`, confirmed.error.name, confirmed.error.statusCode);
      return failure(request, 'temporary');
    }

    return success(request, confirmation.source);
  } catch (error) {
    console.error('Resend confirmation exception:', error instanceof Error ? error.name : 'UnknownError');
    return failure(request, 'temporary');
  }
};
