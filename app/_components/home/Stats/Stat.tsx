'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../../../_lib/motion';
import type { StatItem } from '../../../_types/home';
import styles from './_Stats.module.scss';

export function Stat({ item }: { item: StatItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);

  useGSAP(
    () => {
      if (!ref.current) return;
      const counter = { val: 0 };
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        ScrollTrigger.create({
          trigger: ref.current,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.to(counter, {
              val: item.value,
              duration: 1.4,
              ease: 'power2.out',
              onUpdate: () => setValue(Math.round(counter.val)),
            });
          },
        });
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        setValue(item.value);
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={styles.stat}>
      <div className={styles.value}>
        {value}
        {item.suffix && <span className={styles.small}>{item.suffix}</span>}
      </div>
      <div className={styles.label}>{item.label}</div>
    </div>
  );
}
