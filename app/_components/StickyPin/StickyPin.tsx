'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollSmoother, ScrollTrigger } from '../../_lib/motion';

type Props = {
  /** Pixel offset from the viewport top — match the SCSS `top` of the sticky rule this backs up. */
  top?: number;
  className?: string;
  children: React.ReactNode;
};

// CSS position:sticky stops working inside ScrollSmoother's transformed
// content, so this re-creates the stick with a ScrollTrigger pin — but only
// when the smoother is actually driving the scroll. On touch / reduced
// motion the SCSS sticky rule still applies and this renders a plain div.
// The media query must mirror the breakpoint where the column layout
// collapses (900px in AboutBio and CaseBlock).
export function StickyPin({ top = 110, className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(
        '(min-width: 901px) and (prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
        () => {
          let st: ScrollTrigger | undefined;
          let id = 0;
          let attempts = 0;
          // The smoother is created by a parent effect that runs after this
          // child effect in the same commit — poll a few frames rather than
          // assume exactly one.
          const tryPin = () => {
            if (!ScrollSmoother.get()) {
              if (attempts++ < 5) id = requestAnimationFrame(tryPin);
              return;
            }
            const parent = el.parentElement;
            if (!parent || parent.offsetHeight <= el.offsetHeight) return;
            st = ScrollTrigger.create({
              trigger: el,
              start: `top ${top}px`,
              endTrigger: parent,
              end: () => `bottom ${top + el.offsetHeight}px`,
              pin: el,
              pinSpacing: false,
            });
          };
          id = requestAnimationFrame(tryPin);
          return () => {
            cancelAnimationFrame(id);
            st?.kill();
          };
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
