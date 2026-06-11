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
  // True while the in-flight route change came from browser back/forward.
  const isPopRef = useRef(false);
  // Set by the smoother context; re-collects [data-skew] targets after a
  // route paints new media.
  const recollectSkewRef = useRef<() => void>(() => {});

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

          // Velocity skew: [data-skew] blocks lean with scroll speed and
          // settle upright when it stops. Deliberately NOT the whole <main>
          // — a per-frame skew on an ancestor of pinned elements (gallery
          // pin, StickyPin) wobbles what should be holding still. Driven by
          // the SMOOTHED velocity on the ticker, not raw scroll events:
          // native scroll stops at the page-end clamp while the smoother
          // glides on for ~1s, and the last sections (Recognition, EndCTA)
          // arrive during that glide — event-driven skew is already zero by
          // then. Targets are re-collected per route via recollectSkewRef.
          let skew = 0;
          let resting = true;
          let skewSetters: ReturnType<typeof gsap.quickSetter>[] = [];
          const collectSkewTargets = () => {
            skewSetters = gsap.utils.toArray<Element>('[data-skew]').map((el) => {
              gsap.set(el, { force3D: true });
              return gsap.quickSetter(el, 'skewY', 'deg');
            });
          };
          collectSkewTargets();
          recollectSkewRef.current = collectSkewTargets;
          const clampSkew = gsap.utils.clamp(-3, 3);
          const onTick = () => {
            const target = clampSkew(smoother.getVelocity() / -400);
            skew += (target - skew) * 0.12;
            if (Math.abs(skew) < 0.005 && target === 0) {
              // Settle exactly upright once, then idle until the next move.
              if (!resting) {
                skew = 0;
                skewSetters.forEach((set) => set(0));
                resting = true;
              }
              return;
            }
            resting = false;
            skewSetters.forEach((set) => set(skew));
          };
          gsap.ticker.add(onTick);

          return () => {
            gsap.ticker.remove(onTick);
            recollectSkewRef.current = () => {};
            skewSetters = [];
            smoother.kill();
          };
        },
      );
    },
    { scope: wrapperRef },
  );

  useEffect(() => {
    const onPop = () => {
      isPopRef.current = true;
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Each route paints new content. Back/forward keeps the browser-restored
  // position; pushes land at the top. Next *does* reset native scroll on
  // push, but when the new page is shorter than the old scroll offset,
  // ScrollSmoother's ResizeObserver clamp ("don't be past the end") compares
  // the new max against its stale pre-navigation transform and writes the old
  // offset back to window scroll — so force 0 explicitly instead of trusting
  // window.scrollY. Then pick up the new page's [data-speed]/[data-lag]
  // elements and re-measure every ScrollTrigger.
  useEffect(() => {
    const isPop = isPopRef.current;
    isPopRef.current = false;
    const smoother = ScrollSmoother.get();
    if (!smoother) return;
    const id = requestAnimationFrame(() => {
      // effects() only dedupes elements it's handed again — effect triggers
      // for the previous page's removed [data-speed]/[data-lag] nodes leak
      // and get re-measured (detached, rect = 0) on every refresh. Kill them.
      smoother.effects().forEach((st) => {
        if (st.trigger instanceof Element && !document.documentElement.contains(st.trigger)) {
          st.kill();
        }
      });
      smoother.scrollTo(isPop ? window.scrollY : 0, false);
      // refresh: false — the explicit refresh on the next line covers it;
      // without it every navigation pays for two back-to-back refreshes.
      // The cast is needed because the option is honoured by the 3.15 source
      // (`config.refresh !== false && ScrollTrigger.refresh()`) but missing
      // from EffectsVars in gsap's typings.
      smoother.effects('[data-speed], [data-lag]', {
        refresh: false,
      } as ScrollSmoother.EffectsVars & { refresh: boolean });
      recollectSkewRef.current();
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Web fonts settle after the route refresh (SplitText re-splits, line wraps
  // change) and ScrollSmoother's ResizeObserver only re-measures the body
  // spacer — not pins or reveal triggers. One full refresh once fonts land
  // keeps every trigger honest; fonts.ready resolves once per document.
  useEffect(() => {
    let id = 0;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      id = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <div ref={wrapperRef}>
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
