export type AccentSwatch = {
  hex: string;
  label: string;
};

export const accentSwatches = [
  { hex: '#1f3a5f', label: 'Ink navy' },
  { hex: '#2e5a3e', label: 'Forest' },
  { hex: '#7a2e2e', label: 'Burgundy' },
  { hex: '#b88a30', label: 'Mustard' },
  { hex: '#0a0908', label: 'Mono (no accent)' },
] as const satisfies readonly AccentSwatch[];

export const defaultAccent: AccentSwatch = accentSwatches[0];

export const ACCENT_STORAGE_KEY = 'mn-accent-v2';

export function findSwatch(hex: string | null | undefined): AccentSwatch | null {
  if (!hex) return null;
  return accentSwatches.find((s) => s.hex === hex) ?? null;
}
