'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../_lib/motion';
import styles from './_PageIntro.module.scss';

type Props = {
  label: string;
  title?: string;
  titleNodes?: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
};

export function PageIntro({ label, title, titleNodes, sub, className }: Props) {
  const headerRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const titleInnerRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          defaults: { ease: 'expo.out' },
        });
        tl.from(labelRef.current, { opacity: 0, y: 8, duration: 0.55 }, 0);
        tl.from(titleInnerRef.current, { yPercent: 110, duration: 1.0 }, 0.1);
        if (subRef.current) {
          tl.from(subRef.current, { opacity: 0, y: 8, duration: 0.55 }, 0.5);
        }
      });
    },
    { scope: headerRef },
  );

  return (
    <header ref={headerRef} className={['page-intro', className].filter(Boolean).join(' ')}>
      <span ref={labelRef} className="page-intro__label">
        {label}
      </span>
      <h1 className={`page-intro__title ${styles.titleClip}`}>
        <span ref={titleInnerRef} className={styles.titleInner}>
          {titleNodes ?? title}
        </span>
      </h1>
      {sub && (
        <p ref={subRef} className="page-intro__sub">
          {sub}
        </p>
      )}
    </header>
  );
}
