import { Resend } from 'resend';
import type { ContactInput } from './contact-schema';

const TOPIC_LABELS: Record<ContactInput['topic'], string> = {
  'a-b-testing': 'A/B testing',
  'frontend-build': 'Frontend build',
  'product-work': 'Product work',
  'something-else': 'Something else',
};

export async function sendContactEmail(
  input: Pick<ContactInput, 'name' | 'email' | 'topic' | 'message'>,
): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  const to = process.env.CONTACT_TO;

  if (!apiKey || !from || !to) {
    throw new Error('Email transport not configured.');
  }

  const resend = new Resend(apiKey);
  const topicLabel = TOPIC_LABELS[input.topic];

  const subject = `Portfolio · ${topicLabel} · from ${input.name}`;
  const text = [
    `From: ${input.name} <${input.email}>`,
    `Topic: ${topicLabel}`,
    '',
    input.message,
  ].join('\n');

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
    replyTo: input.email,
  });

  if (error) {
    throw new Error(error.message ?? 'Resend send failed.');
  }
  if (!data?.id) {
    throw new Error('Resend response missing id.');
  }
  return data.id;
}
