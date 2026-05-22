'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../_lib/motion';
import styles from './_Loader.module.scss';

export function Loader() {
  const containerRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const routeBarRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

        tl.to(progressFillRef.current, {
          scaleX: 1,
          duration: 0.55,
          ease: 'power2.out',
        });

        tl.to(
          [wordmarkRef.current, captionRef.current, progressTrackRef.current, hairlineRef.current],
          {
            opacity: 0,
            duration: 0.2,
          },
          '+=0.1',
        );

        tl.to(
          containerRef.current,
          {
            yPercent: -100,
            duration: 0.55,
            ease: 'expo.inOut',
          },
          '-=0.05',
        );

        tl.set(containerRef.current, {
          display: 'none',
          onComplete: () => {
            document.body.style.overflow = '';
          },
        });
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(progressFillRef.current, { scaleX: 1 });
        gsap.delayedCall(0.2, () => {
          gsap.set(containerRef.current, { display: 'none' });
          document.body.style.overflow = '';
        });
      });
    },
    { scope: containerRef },
  );

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const bar = routeBarRef.current;
    if (!bar) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const tl = gsap.timeline();
    tl.set(bar, { display: 'block', scaleX: 0, transformOrigin: 'left center' });
    tl.to(bar, { scaleX: 1, duration: 0.3, ease: 'power2.out' });
    tl.set(bar, { transformOrigin: 'right center' });
    tl.to(bar, { scaleX: 0, duration: 0.3, ease: 'power2.in' });
    tl.set(bar, { display: 'none' });
  }, [pathname]);

  return (
    <aside ref={containerRef} aria-hidden="true" className={styles.loader} data-loader>
      <div ref={routeBarRef} className={styles.routeBar} />
      <div ref={wordmarkRef} className={styles.wordmark}>
        Mainul<span className={styles.dot}>.</span>
      </div>
      <div ref={hairlineRef} className={styles.hairline} />
      <div ref={captionRef} className={styles.caption}>
        Portfolio v3 · 2026
      </div>
      <div ref={progressTrackRef} className={styles.progressTrack}>
        <div ref={progressFillRef} className={styles.progressFill} />
      </div>
    </aside>
  );
}
