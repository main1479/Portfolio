import type { Variant } from '../_types/home';

const KEY = 'mi-hero-variant';

// sessionStorage on purpose: a returning visit can re-roll the bucket, which
// is the point of the bit — the portfolio itself runs as a live A/B test.
export function assignVariant(): Variant {
  try {
    const stored = sessionStorage.getItem(KEY);
    if (stored === 'A' || stored === 'B') return stored;
    const assigned: Variant = Math.random() < 0.5 ? 'A' : 'B';
    sessionStorage.setItem(KEY, assigned);
    return assigned;
  } catch {
    // Private mode / blocked storage: deterministic control bucket.
    return 'A';
  }
}
