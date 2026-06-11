'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../_lib/motion';
import { onLoaderDone } from '../../_lib/loader-signal';

type Props = {
  text: string;
  className?: string;
  delay?: number;
  /** 'scroll' decodes on entering view; 'loader' decodes as the intro loader lifts. */
  mode?: 'scroll' | 'loader';
};

// Mono labels descramble into place — terminal-decode flavour for the data-y
// details. The real text is in the markup from the start (SEO/SR safe; the
// tween only rewrites the same string) and never moves for reduced motion.
export function ScrambleIn({ text, className, delay = 0, mode = 'scroll' }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const vars: gsap.TweenVars = {
          duration: 0.9,
          delay,
          scrambleText: { text, chars: '01<>/·_', speed: 0.9 },
        };

        if (mode === 'loader') {
          const tween = gsap.to(el, { ...vars, paused: true });
          const unsubscribe = onLoaderDone(() => tween.play());
          return () => unsubscribe();
        }

        gsap.to(el, {
          ...vars,
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
