'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../../_lib/motion';
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
        gsap.to(trackRef.current, {
          xPercent: -50,
          duration: 38,
          repeat: -1,
          ease: 'none',
        });
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
