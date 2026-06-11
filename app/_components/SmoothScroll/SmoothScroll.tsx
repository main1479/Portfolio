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

          // Velocity skew: media blocks ([data-skew]) lean with scroll speed
          // and settle upright when it stops. Deliberately NOT the whole
          // <main> — a per-frame skew on an ancestor of pinned elements
          // (gallery pin, StickyPin) wobbles what should be holding still.
          // Targets are re-collected per route via recollectSkewRef.
          const proxy = { skew: 0 };
          let skewSetters: ReturnType<typeof gsap.quickSetter>[] = [];
          const collectSkewTargets = () => {
            skewSetters = gsap.utils.toArray<Element>('[data-skew]').map((el) => {
              gsap.set(el, { force3D: true });
              return gsap.quickSetter(el, 'skewY', 'deg');
            });
          };
          collectSkewTargets();
          recollectSkewRef.current = collectSkewTargets;
          const applySkew = () => skewSetters.forEach((set) => set(proxy.skew));
          const clampSkew = gsap.utils.clamp(-3, 3);
          const skewTrigger = ScrollTrigger.create({
            onUpdate: (self) => {
              const skew = clampSkew(self.getVelocity() / -400);
              // Only take over when the new impulse is stronger than the
              // current lean — otherwise let the decay finish.
              if (Math.abs(skew) > Math.abs(proxy.skew)) {
                proxy.skew = skew;
                gsap.to(proxy, {
                  skew: 0,
                  duration: 0.7,
                  ease: 'power3',
                  overwrite: true,
                  onUpdate: applySkew,
                });
              }
            },
          });

          return () => {
            skewTrigger.kill();
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
