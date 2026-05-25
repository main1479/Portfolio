'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { gsap } from '../../_lib/motion';
import styles from './_PageTransition.module.scss';

export function PageTransition() {
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const panelIsUp = useRef(false);

  // Intercept internal link clicks. Play the cover BEFORE navigation so the
  // user never sees the new page render under a still-rising panel.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = (e.target as HTMLElement | null)?.closest('a');
      if (!link) return;
      if (link.target && link.target !== '_self') return;
      if (link.hasAttribute('download')) return;

      const href = link.getAttribute('href');
      if (!href) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      const involvesCv = url.pathname === '/cv' || window.location.pathname === '/cv';
      if (involvesCv) return;

      const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      const panel = panelRef.current;
      if (!panel) return;

      e.preventDefault();

      gsap.killTweensOf(panel);
      document.body.style.overflow = 'hidden';
      panelIsUp.current = true;

      gsap.set(panel, { display: 'block', yPercent: 100 });
      gsap.to(panel, {
        yPercent: 0,
        duration: 0.35,
        ease: 'expo.inOut',
        onComplete: () => {
          router.push(url.pathname + url.search + url.hash);
        },
      });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [router]);

  // After the new page mounts, slide the panel back off — but only if we
  // raised it in the first place. Back/forward and direct-URL nav leave
  // panelIsUp false and get an instant transition (no panel sweep).
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !panelIsUp.current) return;

    gsap.killTweensOf(panel);
    gsap.to(panel, {
      yPercent: -100,
      duration: 0.4,
      ease: 'expo.inOut',
      onComplete: () => {
        gsap.set(panel, { display: 'none' });
        document.body.style.overflow = '';
        panelIsUp.current = false;
      },
    });
  }, [pathname]);

  return <div ref={panelRef} className={styles.panel} aria-hidden="true" />;
}
