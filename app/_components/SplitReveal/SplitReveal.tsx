'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, SplitText } from '../../_lib/motion';
import { onLoaderDone } from '../../_lib/loader-signal';

type Props = {
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  type?: 'lines' | 'words' | 'chars';
  /**
   * scroll — rise out of the mask when scrolled into view.
   * mount — rise immediately on mount.
   * loader — wait for the intro loader to lift (immediate after client navigations).
   */
  mode?: 'scroll' | 'mount' | 'loader';
  delay?: number;
  className?: string;
  children: React.ReactNode;
};

const STAGGER = { lines: 0.09, words: 0.05, chars: 0.018 } as const;
const DURATION = { lines: 1.0, words: 0.9, chars: 0.8 } as const;

// Masked text reveal: lines/words/chars rise out of an invisible clip.
// SplitText's default aria handling keeps the unsplit text readable to
// screen readers (label on the element, split pieces hidden).
export function SplitReveal({
  as = 'div',
  type = 'lines',
  mode = 'scroll',
  delay = 0,
  className,
  children,
}: Props) {
  const Tag = as as React.ElementType;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        let split: SplitText | undefined;
        let unsubscribe: (() => void) | undefined;
        let cancelled = false;

        // Hide until the split has applied its initial offsets — otherwise
        // the text flashes visible while web fonts finish loading.
        gsap.set(el, { autoAlpha: 0 });

        document.fonts.ready.then(() => {
          if (cancelled) {
            // Context already cleaned up — make sure the pre-split hide
            // can't outlive it.
            gsap.set(el, { clearProps: 'visibility,opacity' });
            return;
          }
          split = SplitText.create(el, {
            type,
            mask: type,
            // Only line splits change with element width; re-split keeps
            // wrapping correct on resize.
            autoSplit: type === 'lines',
            onSplit: (self) => {
              const targets = self[type];
              if (!targets.length) return;
              const vars = {
                yPercent: 110,
                duration: DURATION[type],
                ease: 'expo.out',
                stagger: STAGGER[type],
                delay,
              };
              if (mode === 'scroll') {
                return gsap.from(targets, {
                  ...vars,
                  scrollTrigger: { trigger: el, start: 'top 85%', once: true },
                });
              }
              const tween = gsap.from(targets, { ...vars, paused: true });
              if (mode === 'mount') tween.play();
              else unsubscribe = onLoaderDone(() => tween.play());
              return tween;
            },
          });
          gsap.set(el, { autoAlpha: 1 });
        });

        return () => {
          cancelled = true;
          unsubscribe?.();
          split?.revert();
          gsap.set(el, { clearProps: 'visibility,opacity' });
        };
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
