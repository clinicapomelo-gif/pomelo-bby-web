import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { decryptNewsletterConfirmation } from '../../../lib/newsletter-confirmation';

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
    const value = (await request.formData()).get('token');
    token = typeof value === 'string' ? value : '';
  } catch {
    return failure(request);
  }

  const secret = import.meta.env.NEWSLETTER_CONFIRMATION_SECRET;
  const resendKey = import.meta.env.RESEND_API_KEY;
  const segmentId = import.meta.env.RESEND_NEWSLETTER_SEGMENT_ID;
  const topicId = import.meta.env.RESEND_NEWSLETTER_TOPIC_ID;
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
    const alreadyConfirmed = previousConsent?.type === 'string' &&
      previousConsent.value === confirmation.consentedAt;

    if (alreadyConfirmed) return success(request, confirmation.source);

    const properties = {
      signup_source: confirmation.source,
      consent_version: confirmation.consentVersion,
      consented_at: confirmation.consentedAt,
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

    const updated = await resend.contacts.update({
      email: confirmation.email,
      firstName: confirmation.name,
      unsubscribed: false,
    });
    if (updated.error) {
      console.error('Resend confirmed contact update failed', updated.error.name, updated.error.statusCode);
      return failure(request, 'temporary');
    }

    const segments = await resend.contacts.segments.list({ email: confirmation.email });
    if (segments.error) {
      console.error('Resend confirmed segment lookup failed', segments.error.name, segments.error.statusCode);
      return failure(request, 'temporary');
    }

    if (!segments.data?.data.some((segment) => segment.id === segmentId)) {
      const segment = await resend.contacts.segments.add({
        email: confirmation.email,
        segmentId,
      });
      if (segment.error) {
        console.error('Resend confirmed segment update failed', segment.error.name, segment.error.statusCode);
        return failure(request, 'temporary');
      }
    }

    const topic = await resend.contacts.topics.update({
      email: confirmation.email,
      topics: [{ id: topicId, subscription: 'opt_in' }],
    });
    if (topic.error) {
      console.error('Resend confirmed topic update failed', topic.error.name, topic.error.statusCode);
      return failure(request, 'temporary');
    }

    const consent = await resend.contacts.update({
      email: confirmation.email,
      properties,
    });
    if (consent.error) {
      console.error('Resend confirmed consent update failed', consent.error.name, consent.error.statusCode);
      return failure(request, 'temporary');
    }

    return success(request, confirmation.source);
  } catch (error) {
    console.error('Resend confirmation exception:', error instanceof Error ? error.name : 'UnknownError');
    return failure(request, 'temporary');
  }
};
