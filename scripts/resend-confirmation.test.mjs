import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmExistingContact } from '../src/lib/resend-contact-confirmation.mjs';

const confirmation = {
  email: 'familia@example.com',
  name: 'Familia',
  segmentId: 'segment-newsletter',
  topicId: 'topic-newsletter',
  properties: {
    signup_source: 'newsletter',
    consent_version: 'newsletter_v1',
    consented_at: '2026-08-20T12:00:00.000Z',
  },
};

const response = (error = null, data = {}) => ({ data, error });
const temporaryError = { name: 'temporary', statusCode: 503 };

const fixture = ({ failTopicOnce = false, failSegmentOnce = false, failCommitOnce = false } = {}) => {
  const state = {
    events: [],
    properties: {},
    inSegment: false,
    topic: 'opt_out',
    unsubscribed: true,
  };

  const contacts = {
    update: async (payload) => {
      const commitsConsent = Boolean(payload.properties?.consented_at);
      state.events.push(commitsConsent ? 'consent:commit' : 'contact:update');
      if (commitsConsent && failCommitOnce) {
        failCommitOnce = false;
        return response(temporaryError);
      }
      if (payload.properties) Object.assign(state.properties, payload.properties);
      if (typeof payload.unsubscribed === 'boolean') state.unsubscribed = payload.unsubscribed;
      return response();
    },
    segments: {
      list: async () => {
        state.events.push('segment:list');
        return response(null, { data: state.inSegment ? [{ id: confirmation.segmentId }] : [] });
      },
      add: async () => {
        state.events.push('segment:add');
        if (failSegmentOnce) {
          failSegmentOnce = false;
          return response(temporaryError);
        }
        state.inSegment = true;
        return response();
      },
    },
    topics: {
      update: async () => {
        state.events.push('topic:opt-in');
        if (failTopicOnce) {
          failTopicOnce = false;
          return response(temporaryError);
        }
        state.topic = 'opt_in';
        return response();
      },
    },
  };

  const attempt = async () => {
    const committedAt = Date.parse(String(state.properties.consented_at ?? ''));
    if (Number.isFinite(committedAt) && committedAt >= Date.parse(confirmation.properties.consented_at)) {
      return { ok: true, replay: true };
    }
    return confirmExistingContact({
      contacts,
      ...confirmation,
      now: () => confirmation.properties.consented_at,
    });
  };

  return { attempt, contacts, state };
};

test('guarda consented_at solo después de completar Segmento y Topic', async () => {
  const { attempt, state } = fixture();

  assert.equal((await attempt()).ok, true);
  assert.equal(state.inSegment, true);
  assert.equal(state.topic, 'opt_in');
  assert.equal(state.properties.consented_at, confirmation.properties.consented_at);
  assert.equal(state.events.at(-1), 'consent:commit');
});

test('un fallo de Topic no confirma parcialmente y el reintento lo repara', async () => {
  const { attempt, state } = fixture({ failTopicOnce: true });

  assert.equal((await attempt()).ok, false);
  assert.equal(state.properties.consented_at, undefined);

  assert.equal((await attempt()).ok, true);
  assert.equal(state.topic, 'opt_in');
  assert.equal(state.inSegment, true);
  assert.equal(state.properties.consented_at, confirmation.properties.consented_at);
});

test('un fallo al guardar la marca no reactiva globalmente el contacto y el reintento lo repara', async () => {
  const { attempt, state } = fixture({ failCommitOnce: true });

  assert.equal((await attempt()).ok, false);
  assert.equal(state.properties.consented_at, undefined);
  assert.equal(state.unsubscribed, true);

  assert.equal((await attempt()).ok, true);
  assert.equal(state.unsubscribed, false);
  assert.equal(state.properties.consented_at, confirmation.properties.consented_at);
});

test('guarda como marca la hora de finalización de la confirmación', async () => {
  const { contacts, state } = fixture();

  await confirmExistingContact({
    contacts,
    ...confirmation,
    now: () => '2026-08-20T12:03:00.000Z',
  });

  assert.equal(state.properties.consented_at, '2026-08-20T12:03:00.000Z');
});

test('un fallo al añadir el Segmento no confirma parcialmente y el reintento lo repara', async () => {
  const { attempt, state } = fixture({ failSegmentOnce: true });

  assert.equal((await attempt()).ok, false);
  assert.equal(state.properties.consented_at, undefined);

  assert.equal((await attempt()).ok, true);
  assert.equal(state.inSegment, true);
  assert.equal(state.topic, 'opt_in');
  assert.equal(state.properties.consented_at, confirmation.properties.consented_at);
});
