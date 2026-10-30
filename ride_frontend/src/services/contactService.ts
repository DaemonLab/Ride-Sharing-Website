export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** Uses a separate public form endpoint; never forwards application credentials. */
export async function submitContactMessage(message: ContactMessage): Promise<void> {
  const response = await fetch('https://formsubmit.co/ajax/ershavait@gmail.com', {
    method: 'POST',
    credentials: 'omit',
    // FormSubmit needs the sending site's origin for activation. This overrides
    // the app's no-referrer default without sharing page paths or query strings.
    referrerPolicy: 'strict-origin',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    signal: AbortSignal.timeout(20_000),
    body: JSON.stringify({
      name: message.name,
      email: message.email,
      subject: message.subject,
      message: message.message,
      _subject: `RideShare contact: ${message.subject}`,
      _template: 'table',
    }),
  });
  if (response.status === 429) throw new Error('CONTACT_RATE_LIMIT');
  if (!response.ok) throw new Error('CONTACT_UNAVAILABLE');
  const result: unknown = await response.json();
  // The service can return HTTP 200 with success="false". Never treat that
  // truthy string, an HTML response, or an unexpected payload as delivery.
  if (!result || typeof result !== 'object' || !('success' in result)
    || (result.success !== true && result.success !== 'true')) {
    throw new Error('CONTACT_NOT_ACCEPTED');
  }
}
