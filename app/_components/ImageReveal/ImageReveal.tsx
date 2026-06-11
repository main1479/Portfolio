'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../_lib/motion';
import styles from './_ImageReveal.module.scss';

type Props = {
  className?: string;
  children: React.ReactNode;
};

// Curtain unveil for imagery: the wrapper wipes open bottom-to-top while the
// content settles from a slight zoom. Fires once on scroll-in. Reduced
// motion: rendered as-is (resting clip-path shows everything).
export function ImageReveal({ className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const inner = innerRef.current;
      if (!el || !inner) return;
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          defaults: { duration: 1.2, ease: 'expo.out' },
        });
        tl.from(el, { clipPath: 'inset(0% 0% 100% 0%)' }, 0).from(inner, { scale: 1.15 }, 0);
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={[styles.reveal, className].filter(Boolean).join(' ')} data-skew>
      <div ref={innerRef} className={styles.inner}>
        {children}
      </div>
    </div>
  );
}
