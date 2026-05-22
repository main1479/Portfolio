'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../../_lib/motion';
import type { RecognitionItem } from '../../../_types/home';
import styles from './_Recognition.module.scss';

export function AwardCard({ item }: { item: RecognitionItem }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to(ringRef.current, {
          rotate: 360,
          duration: 30,
          repeat: -1,
          ease: 'none',
          transformOrigin: '50% 50%',
        });
      });
    },
    { scope: cardRef },
  );

  return (
    <a
      ref={cardRef}
      className={styles.award}
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles.seal} aria-hidden="true">
        <span ref={ringRef} className={styles.ring} />
        {item.sealText}
      </div>
      <h3 className={styles.title}>
        {item.titleLines[0]}
        <br />
        {item.titleLines[1]}
      </h3>
      <div className={styles.meta}>
        <span>{item.source}</span>
        <span aria-hidden="true">·</span>
        <span>{item.date}</span>
      </div>
      <span className={styles.cta}>
        View feature <span aria-hidden="true">↗</span>
      </span>
    </a>
  );
}
