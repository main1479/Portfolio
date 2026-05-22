'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function RevealRoot() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const nodes = document.querySelectorAll('.reveal:not(.is-inview)');
    if (nodes.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    nodes.forEach((node) => io.observe(node));

    return () => {
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
