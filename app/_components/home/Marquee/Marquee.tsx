'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../../../_lib/motion';
import type { HomeContent } from '../../../_types/home';
import styles from './_Marquee.module.scss';

type Props = { tokens: HomeContent['marquee']['tokens'] };

function MarqueeTokens({ tokens }: Props) {
  return (
    <span className={styles.tokens}>
      {tokens.map((tok, i) => (
        <span key={i} className={styles.token}>
          <span className={tok.accent ? styles.accent : undefined}>{tok.label}</span>
          <span className={styles.dot} aria-hidden="true" />
        </span>
      ))}
    </span>
  );
}

export function Marquee({ tokens }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const track = trackRef.current;
        if (!track) return;
        const drift = gsap.to(track, {
          xPercent: -50,
          duration: 38,
          repeat: -1,
          ease: 'none',
        });

        // Scroll velocity feeds the marquee: scroll fast and it speeds up,
        // leans into the motion, reverses when you scroll up — then settles.
        let settle: gsap.core.Tween | undefined;
        const st = ScrollTrigger.create({
          onUpdate(self) {
            const v = self.getVelocity();
            gsap.to(drift, {
              timeScale: gsap.utils.clamp(-4, 4, 1 + v / 500),
              duration: 0.2,
              overwrite: true,
            });
            gsap.to(track, {
              skewX: gsap.utils.clamp(-6, 6, v / 400),
              duration: 0.2,
              overwrite: 'auto',
            });
            settle?.kill();
            settle = gsap.delayedCall(0.25, () => {
              gsap.to(drift, { timeScale: 1, duration: 1.4, ease: 'power3.out', overwrite: true });
              gsap.to(track, { skewX: 0, duration: 1, ease: 'power3.out', overwrite: 'auto' });
            });
          },
        });

        return () => {
          settle?.kill();
          st.kill();
          drift.kill();
        };
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className={styles.marquee} aria-hidden="true">
      <div ref={trackRef} className={styles.track}>
        <MarqueeTokens tokens={tokens} />
        <MarqueeTokens tokens={tokens} />
      </div>
    </div>
  );
}
