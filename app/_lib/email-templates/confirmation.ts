import type { ContactInput } from '../contact-schema';
import { EMAIL_COLOURS as C, EMAIL_FONTS as F, TOPIC_LABELS, esc, nl2br } from './shared';

type Input = Pick<ContactInput, 'name' | 'email' | 'topic' | 'message'> & {
  /** Mainul's reachable email — the recipient's reply-to target if they want to follow up. */
  ownerEmail: string;
  /** Mainul's name, signed at the bottom. */
  ownerName: string;
};

export function confirmationEmail(input: Input) {
  const topicLabel = TOPIC_LABELS[input.topic];
  const firstName = input.name.split(/\s+/)[0] || input.name;
  const subject = `Thanks — I’ll get back to you (your portfolio enquiry)`;

  const text = [
    `Hi ${firstName},`,
    '',
    `Thanks for reaching out about ${topicLabel}. I usually reply within a day or two.`,
    '',
    `If it's time-sensitive, you can reach me directly:`,
    `  ${input.ownerEmail}`,
    '',
    "For your records, here's the message you sent:",
    '— — —',
    input.message,
    '— — —',
    '',
    `— ${input.ownerName}`,
    'Frontend Developer · A/B Testing & Experimentation',
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
        Received
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 24px 0;font-family:${F.display};font-size:38px;line-height:1.02;text-transform:uppercase;font-weight:700;letter-spacing:-0.01em;color:${C.fg};">
        Message<br>
        <span style="color:${C.accent};">received.</span>
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 28px 0;font-family:${F.body};font-size:16px;line-height:1.55;color:${C.fgSoft};">
        Hi ${esc(firstName)} —<br><br>
        Thanks for reaching out about <strong style="color:${C.fg};">${esc(topicLabel)}</strong>.
        I usually reply within a day or two.
      </td>
    </tr>
    <tr>
      <td style="padding:18px 24px;background:${C.paper};border-radius:6px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding:0 0 4px 0;font-family:${F.mono};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${C.fgMuted};">
              Time-sensitive?
            </td>
          </tr>
          <tr>
            <td style="font-family:${F.body};font-size:15px;line-height:1.5;color:${C.fg};">
              Reach me directly at
              <a href="mailto:${esc(input.ownerEmail)}" style="color:${C.accent};text-decoration:none;font-weight:600;">
                ${esc(input.ownerEmail)}
              </a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 0 8px 0;font-family:${F.mono};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${C.fgMuted};">
        Your message
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 32px 0;font-family:${F.body};font-size:15px;line-height:1.6;color:${C.fgSoft};border-left:2px solid ${C.ruleStrong};padding-left:16px;">
        ${nl2br(input.message)}
      </td>
    </tr>
    <tr>
      <td style="border-top:1px solid ${C.ruleStrong};padding:18px 0 0 0;font-family:${F.body};font-size:14px;line-height:1.5;color:${C.fgSoft};">
        — ${esc(input.ownerName)}<br>
        <span style="font-family:${F.mono};font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${C.fgMuted};">
          Frontend Developer · A/B Testing &amp; Experimentation
        </span>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}
