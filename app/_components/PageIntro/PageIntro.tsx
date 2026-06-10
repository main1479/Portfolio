'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../_lib/motion';
import { onLoaderDone } from '../../_lib/loader-signal';
import { SplitReveal } from '../SplitReveal/SplitReveal';

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
  const subRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
        tl.from(labelRef.current, { opacity: 0, y: 8, duration: 0.55 }, 0);
        if (subRef.current) {
          tl.from(subRef.current, { opacity: 0, y: 8, duration: 0.55 }, 0.5);
        }
        // Start with the loader lift (immediately after client navigations)
        // so intro and loader read as one move — same signal the title's
        // SplitReveal uses.
        const unsubscribe = onLoaderDone(() => tl.play());
        return () => unsubscribe();
      });
    },
    { scope: headerRef },
  );

  return (
    <header ref={headerRef} className={['page-intro', className].filter(Boolean).join(' ')}>
      <span ref={labelRef} className="page-intro__label">
        {label}
      </span>
      <SplitReveal as="h1" type="lines" mode="loader" delay={0.1} className="page-intro__title">
        {titleNodes ?? title}
      </SplitReveal>
      {sub && (
        <p ref={subRef} className="page-intro__sub">
          {sub}
        </p>
      )}
    </header>
  );
}
