import { Resend } from 'resend';
import type { ContactInput } from './contact-schema';
import { notificationEmail } from './email-templates/notification';
import { confirmationEmail } from './email-templates/confirmation';
import { siteConfig } from './site-config';

/**
 * Sends two emails for a single contact-form submission:
 *
 * 1. Notification to CONTACT_TO (Mainul) — primary. If this fails the
 *    submission is considered failed and the route returns 502.
 * 2. Confirmation to the sender — best-effort. If this fails we log
 *    server-side and still return success, because the primary channel
 *    (Mainul knowing about the message) already succeeded.
 */
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

  // 1. Notification to Mainul.
  const notification = notificationEmail(input);
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: notification.subject,
    text: notification.text,
    html: notification.html,
    replyTo: input.email,
  });

  if (error) {
    throw new Error(error.message ?? 'Resend send failed.');
  }
  if (!data?.id) {
    throw new Error('Resend response missing id.');
  }

  // 2. Confirmation to the sender — best-effort.
  try {
    const confirmation = confirmationEmail({
      ...input,
      ownerEmail: siteConfig.email,
      ownerName: siteConfig.ownerName,
    });
    const { error: confirmError } = await resend.emails.send({
      from,
      to: input.email,
      subject: confirmation.subject,
      text: confirmation.text,
      html: confirmation.html,
      replyTo: siteConfig.email,
    });
    if (confirmError) {
      console.warn('[contact] Confirmation email failed:', confirmError.message);
    }
  } catch (err) {
    console.warn('[contact] Confirmation email threw:', err);
  }

  return data.id;
}
