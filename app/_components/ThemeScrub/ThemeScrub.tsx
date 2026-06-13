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

      // --bg and --fg are exact mirror colours, so scrubbing both at once means
      // they cross through the SAME mid-grey at 50% progress — every bit of
      // text on screen loses its contrast for that instant. The goal is to keep
      // that crossover off any large focal text.
      //
      // When the section above the footer is SHORT (the home page End CTA), it
      // genuinely enters from the bottom — anchor the scrub to it so the
      // inversion finishes as it rises into view and the crossover lands on a
      // sliver at the screen edge.
      //
      // When that section is TALLER than the viewport (e.g. the /work index),
      // its top is already on screen at load, so anchoring there would treat
      // the scrub as complete and snap the page dark immediately. Fall back to
      // the footer: by the time it enters, the section's big content has
      // scrolled past and only its small tail is on screen during the crossover.
      const prev = footer.previousElementSibling;
      const trigger =
        prev instanceof HTMLElement && prev.getBoundingClientRect().height < window.innerHeight
          ? prev
          : footer;

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Element reference, not the 'html' selector: useGSAP's scope
        // resolves selector text inside this ref's subtree, so 'html' matches
        // nothing and the scrub silently no-ops.
        const tween = gsap.to(document.documentElement, {
          ...DARK_TOKENS,
          ease: 'none',
          scrollTrigger: {
            trigger,
            start: 'top bottom',
            end: 'top 55%',
            scrub: true,
          },
        });
        // Leaving the page mid-dark (curtain navigation from the footer) must
        // not leak inverted tokens onto the next page.
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(document.documentElement, {
            clearProps: Object.keys(DARK_TOKENS).join(','),
          });
        };
      });
    },
    { scope: ref },
  );

  return <div ref={ref} aria-hidden="true" />;
}
