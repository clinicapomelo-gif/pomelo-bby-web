export const confirmExistingContact = async ({
  contacts,
  email,
  name,
  segmentId,
  topicId,
  properties,
  now = () => new Date().toISOString(),
}) => {
  const segments = await contacts.segments.list({ email });
  if (segments.error) return { ok: false, operation: 'segment lookup', error: segments.error };

  if (!segments.data?.data.some((segment) => segment.id === segmentId)) {
    const segment = await contacts.segments.add({ email, segmentId });
    if (segment.error) return { ok: false, operation: 'segment update', error: segment.error };
  }

  const topic = await contacts.topics.update({
    email,
    topics: [{ id: topicId, subscription: 'opt_in' }],
  });
  if (topic.error) return { ok: false, operation: 'topic update', error: topic.error };

  // Commit the global reactivation and marker last so retries can repair partial updates.
  const requestedAt = Date.parse(properties.consented_at);
  const completedAt = Date.parse(now());
  const consentedAt = new Date(Math.max(requestedAt, completedAt)).toISOString();
  const committed = await contacts.update({
    email,
    firstName: name,
    unsubscribed: false,
    properties: { ...properties, consented_at: consentedAt },
  });
  if (committed.error) return { ok: false, operation: 'consent commit', error: committed.error };

  return { ok: true };
};
