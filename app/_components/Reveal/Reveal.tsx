'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../../_lib/motion';

type Props = {
  delay?: 1 | 2 | 3 | 4 | 5;
  as?: 'div' | 'section' | 'article' | 'header' | 'li' | 'span';
  className?: string;
  children: React.ReactNode;
};

export function Reveal({ delay, as = 'div', className, children }: Props) {
  const Tag = as;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const el = ref.current;
      const staggerDelay = delay ? delay * 0.08 : 0;

      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(el, { opacity: 0, y: 28 });
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: 'expo.out',
              delay: staggerDelay,
            });
          },
        });
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(el, { opacity: 1, y: 0 });
      });
    },
    { scope: ref },
  );

  const TagAny = Tag as React.ElementType;
  return (
    <TagAny ref={ref} className={className}>
      {children}
    </TagAny>
  );
}
