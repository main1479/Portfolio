'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../_lib/motion';

type Props = {
  /** Percent offsets of the element's own size, scrubbed across the scroll range. */
  yFrom?: number;
  yTo?: number;
  xFrom?: number;
  xTo?: number;
  /** ScrollTrigger positions, measured against the parent so the scrubbed transform doesn't shift its own trigger. */
  start?: string;
  end?: string;
  className?: string;
  children: React.ReactNode;
};

// Scroll-scrubbed drift wrapper — position is driven by scroll progress, not
// a one-shot trigger. Used for the footer wordmark uncover and similar.
export function Parallax({
  yFrom = 0,
  yTo = 0,
  xFrom = 0,
  xTo = 0,
  start = 'top bottom',
  end = 'bottom bottom',
  className,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          el,
          { yPercent: yFrom, xPercent: xFrom },
          {
            yPercent: yTo,
            xPercent: xTo,
            ease: 'none',
            scrollTrigger: {
              trigger: el.parentElement ?? el,
              start,
              end,
              scrub: true,
            },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
