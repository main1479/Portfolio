'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from '../../_lib/motion';
import styles from './_PageTransition.module.scss';

export function PageTransition() {
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevPathname.current = pathname;
      return;
    }

    const involvesCv = pathname === '/cv' || prevPathname.current === '/cv';
    prevPathname.current = pathname;
    if (involvesCv) return;

    const panel = panelRef.current;
    if (!panel) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    gsap.killTweensOf(panel);
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
      },
    });

    tl.set(panel, { display: 'block', yPercent: 100 });
    tl.to(panel, { yPercent: 0, duration: 0.35, ease: 'expo.inOut' });
    tl.to(panel, { yPercent: -100, duration: 0.4, ease: 'expo.inOut' }, '+=0.05');
    tl.set(panel, { display: 'none' });
  }, [pathname]);

  return <div ref={panelRef} className={styles.panel} aria-hidden="true" />;
}
