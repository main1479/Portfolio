'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../_lib/motion';

// Inverted values for every animated token in _variables.scss. --bg/--fg land
// exactly on --ink/--ink-paper so the page melts into the footer's world.
// All pairs hold WCAG AA at the dark end (see signature-wow-spec).
const DARK_TOKENS = {
  '--bg': '#0a0908',
  '--fg': '#f5f0ec',
  '--fg-soft': 'rgba(245, 240, 236, 0.8)',
  '--fg-muted': 'rgba(245, 240, 236, 0.62)',
  '--rule': 'rgba(245, 240, 236, 0.16)',
  '--rule-strong': 'rgba(245, 240, 236, 0.36)',
  '--paper': '#161412',
  '--paper-deep': '#1d1a17',
  '--accent': '#8fb0d8',
  '--accent-ink': '#10151c',
};

// The lights go down: scrolling into the footer scrubs the whole site palette
// from warm paper to ink (and back out on the way up). Mounted inside Footer
// so every page ends the same way. Renders nothing visible.
export function ThemeScrub() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const footer = ref.current?.closest('footer');
      if (!footer) return;
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tween = gsap.to('html', {
          ...DARK_TOKENS,
          ease: 'none',
          scrollTrigger: {
            trigger: footer,
            start: 'top 92%',
            end: 'top 30%',
            scrub: true,
          },
        });
        // Leaving the page mid-dark (curtain navigation from the footer) must
        // not leak inverted tokens onto the next page.
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set('html', { clearProps: Object.keys(DARK_TOKENS).join(',') });
        };
      });
    },
    { scope: ref },
  );

  return <div ref={ref} aria-hidden="true" />;
}
