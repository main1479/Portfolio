import type { ContactInput } from '../contact-schema';
import { EMAIL_COLOURS as C, EMAIL_FONTS as F, TOPIC_LABELS, esc, nl2br } from './shared';

type Input = Pick<ContactInput, 'name' | 'email' | 'topic' | 'message'>;

export function notificationEmail(input: Input) {
  const topicLabel = TOPIC_LABELS[input.topic];
  const subject = `Portfolio · ${topicLabel} · from ${input.name}`;

  const text = [
    `From: ${input.name} <${input.email}>`,
    `Topic: ${topicLabel}`,
    '',
    input.message,
    '',
    '— Hit reply to respond directly to the sender.',
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:24px;background:${C.bg};font-family:${F.body};color:${C.fg};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;">
    <tr>
      <td style="padding:0 0 20px 0;font-family:${F.mono};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${C.fgMuted};">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${C.accent};vertical-align:middle;margin-right:10px;"></span>
        New message
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 32px 0;font-family:${F.display};font-size:34px;line-height:1.05;text-transform:uppercase;font-weight:700;letter-spacing:-0.01em;color:${C.fg};">
        New enquiry from<br>
        <span style="color:${C.accent};">${esc(input.name)}</span>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 28px;background:${C.paper};border-radius:6px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          ${row('From', `${esc(input.name)} &lt;<a href="mailto:${esc(input.email)}" style="color:${C.accent};text-decoration:none;">${esc(input.email)}</a>&gt;`)}
          ${row('Topic', esc(topicLabel))}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 0 8px 0;font-family:${F.mono};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${C.fgMuted};">
        Message
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 32px 0;font-family:${F.body};font-size:16px;line-height:1.6;color:${C.fg};">
        ${nl2br(input.message)}
      </td>
    </tr>
    <tr>
      <td style="border-top:1px solid ${C.ruleStrong};padding:18px 0 0 0;font-family:${F.mono};font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${C.fgMuted};">
        ↳ Hit reply to respond directly to the sender.
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:6px 0;font-family:${F.mono};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${C.fgMuted};width:80px;vertical-align:top;">
        ${label}
      </td>
      <td style="padding:6px 0;font-family:${F.body};font-size:15px;line-height:1.5;color:${C.fg};">
        ${value}
      </td>
    </tr>`;
}
