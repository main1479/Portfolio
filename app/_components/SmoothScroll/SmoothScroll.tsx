'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollSmoother, ScrollTrigger } from '../../_lib/motion';

// Buttery scroll for the whole page. Touch devices and reduced-motion users
// keep native scrolling — the wrapper divs become inert pass-throughs.
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
        () => {
          const smoother = ScrollSmoother.create({
            wrapper: wrapperRef.current!,
            content: contentRef.current!,
            smooth: 1,
            effects: true,
          });
          return () => smoother.kill();
        },
      );
    },
    { scope: wrapperRef },
  );

  // Each route paints new content: sync to the native scroll position Next
  // just set (top on push, restored on back/forward), pick up the new page's
  // [data-speed]/[data-lag] elements, and re-measure every ScrollTrigger.
  useEffect(() => {
    const smoother = ScrollSmoother.get();
    if (!smoother) return;
    const id = requestAnimationFrame(() => {
      smoother.scrollTo(window.scrollY, false);
      smoother.effects('[data-speed], [data-lag]');
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div ref={wrapperRef}>
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
