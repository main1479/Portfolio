import type { ContactInput } from '../contact-schema';

export const TOPIC_LABELS: Record<ContactInput['topic'], string> = {
  'a-b-testing': 'A/B testing',
  'frontend-build': 'Frontend build',
  'product-work': 'Product work',
  'something-else': 'Something else',
};

/**
 * Email-safe colour tokens — resolved to hex because `var(--…)`,
 * `color-mix()` and CSS custom properties are unsupported in most
 * mail clients (Gmail, Apple Mail, Outlook).
 */
export const EMAIL_COLOURS = {
  bg: '#f5f0ec',
  fg: '#0a0908',
  fgSoft: '#3a3938',
  fgMuted: '#6f6d6b',
  rule: 'rgba(10, 9, 8, 0.14)',
  ruleStrong: 'rgba(10, 9, 8, 0.32)',
  paper: '#ece6e0',
  accent: '#1f3a5f',
  accentInk: '#ffffff',
} as const;

/**
 * Web fonts don't reliably load in mail clients — fall back to safe
 * system stacks. `display` keeps the legacy Teko fallback chain;
 * `mono` mirrors JetBrains Mono's fallback.
 */
export const EMAIL_FONTS = {
  display: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  body: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
} as const;

/** Escape user input before interpolating into HTML strings. */
export function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Newline → <br> for the message body in HTML. */
export function nl2br(value: string): string {
  return esc(value).replace(/\n/g, '<br>');
}
