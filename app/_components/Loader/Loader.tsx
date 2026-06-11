'use client';

import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../_lib/motion';
import { signalLoaderDone } from '../../_lib/loader-signal';
import { assignVariant } from '../../_lib/experiment';
import styles from './_Loader.module.scss';
import { siteConfig } from '@/app/_lib/site-config';

const SCRAMBLE_CHARS = '01<>/·_';

export function Loader() {
  const containerRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
  }, []);

  useGSAP(
    () => {
      // The visit gets bucketed before anything renders — the loader is the
      // assignment ceremony, the hero opens in the variant it stamps here.
      const variant = assignVariant();
      const stampText = `EXP-001 · YOU'RE IN VARIANT ${variant}`;
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const proxy = { v: 0 };
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

        tl.to(
          proxy,
          {
            v: 100,
            duration: 1.3,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (counterRef.current) {
                counterRef.current.textContent = String(Math.round(proxy.v)).padStart(3, '0');
              }
              if (progressFillRef.current) {
                gsap.set(progressFillRef.current, { scaleX: proxy.v / 100 });
              }
            },
          },
          0,
        );

        tl.to(
          statusRef.current,
          {
            duration: 0.4,
            scrambleText: { text: 'calibrating interface', chars: SCRAMBLE_CHARS, speed: 1 },
          },
          0,
        );
        tl.to(
          statusRef.current,
          {
            duration: 0.4,
            scrambleText: { text: 'bucketing visitor', chars: SCRAMBLE_CHARS, speed: 1 },
          },
          0.5,
        );
        tl.to(
          statusRef.current,
          {
            duration: 0.35,
            scrambleText: { text: `variant ${variant} locked`, chars: SCRAMBLE_CHARS, speed: 1 },
          },
          1.0,
        );

        tl.set(stampRef.current, { opacity: 1 }, 0.85);
        tl.to(
          stampRef.current,
          {
            duration: 0.55,
            scrambleText: { text: stampText, chars: 'AB01·', speed: 0.5 },
          },
          0.85,
        );

        tl.to(
          [
            wordmarkRef.current,
            captionRef.current,
            statusRef.current,
            progressTrackRef.current,
            hairlineRef.current,
            stampRef.current,
            counterRef.current,
          ],
          {
            opacity: 0,
            duration: 0.2,
          },
          '+=0.3',
        );

        tl.to(
          containerRef.current,
          {
            yPercent: -100,
            duration: 0.55,
            ease: 'expo.inOut',
            // Hero entrance starts the moment the panel begins lifting, so
            // loader and hero read as one continuous move.
            onStart: signalLoaderDone,
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
        signalLoaderDone();
        gsap.set(progressFillRef.current, { scaleX: 1 });
        if (counterRef.current) counterRef.current.textContent = '100';
        if (statusRef.current) statusRef.current.textContent = `variant ${variant} locked`;
        if (stampRef.current) stampRef.current.textContent = stampText;
        gsap.set(stampRef.current, { opacity: 1 });
        gsap.delayedCall(0.2, () => {
          gsap.set(containerRef.current, { display: 'none' });
          document.body.style.overflow = '';
        });
      });
    },
    { scope: containerRef },
  );

  return (
    <aside ref={containerRef} aria-hidden="true" className={styles.loader} data-loader>
      <div ref={wordmarkRef} className={styles.wordmark}>
        Mainul<span className={styles.dot}>.</span>
      </div>
      <div ref={hairlineRef} className={styles.hairline} />
      <div ref={captionRef} className={styles.caption}>
        Portfolio v3 · {siteConfig.year}
      </div>
      <div ref={statusRef} className={styles.status}>
        initializing
      </div>
      <div ref={progressTrackRef} className={styles.progressTrack}>
        <div ref={progressFillRef} className={styles.progressFill} />
      </div>
      <div ref={stampRef} className={styles.stamp} />
      <div ref={counterRef} className={styles.counter}>
        000
      </div>
    </aside>
  );
}
