'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './_PageCurtain.module.scss';

type Phase = 'idle' | 'covering' | 'covered' | 'lifting';

const ENTER_MS = 680;
const HOLD_MS = 240;
const EXIT_MS = 680;

function isInternalHref(href: string): boolean {
  if (!href) return false;
  if (href.startsWith('#')) return false;
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  if (/^https?:\/\//i.test(href)) {
    if (typeof window === 'undefined') return false;
    try {
      return new URL(href).origin === window.location.origin;
    } catch {
      return false;
    }
  }
  return href.startsWith('/');
}

function normalisedPath(href: string): string {
  if (typeof window === 'undefined') return href;
  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return href;
  }
}

const ARCH_PATH = 'M 0 12 Q 50 0 100 12 L 100 88 Q 50 100 0 88 Z';

export function PageCurtain() {
  const [phase, setPhase] = useState<Phase>('idle');
  const router = useRouter();
  const inFlight = useRef(false);

  const trigger = useCallback(
    (href: string) => {
      if (inFlight.current) return;
      const reduceMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduceMotion) {
        router.push(href);
        return;
      }

      inFlight.current = true;
      setPhase('covering');

      window.setTimeout(() => {
        setPhase('covered');
        const doc = document as Document & {
          startViewTransition?: (cb: () => void) => { finished: Promise<void> };
        };
        if (typeof doc.startViewTransition === 'function') {
          doc.startViewTransition(() => router.push(href));
        } else {
          router.push(href);
        }
      }, ENTER_MS);

      window.setTimeout(() => {
        setPhase('lifting');
      }, ENTER_MS + HOLD_MS);

      window.setTimeout(
        () => {
          setPhase('idle');
          inFlight.current = false;
        },
        ENTER_MS + HOLD_MS + EXIT_MS,
      );
    },
    [router],
  );

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;
      if (anchor.dataset.curtain === 'off') return;

      const rawHref = anchor.getAttribute('href') ?? '';
      if (!isInternalHref(rawHref)) return;

      const dest = normalisedPath(rawHref);
      if (dest === window.location.pathname) return;

      event.preventDefault();
      // No stopPropagation — other capture/bubble handlers attached to the
      // anchor (e.g. Nav's onLinkClick that closes the mobile drawer) still
      // need to run. next/link's onClick checks defaultPrevented and bails.
      trigger(dest);
    };

    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, [trigger]);

  return (
    <div aria-hidden="true" className={styles.curtain} data-phase={phase}>
      <div className={`${styles.sheet} ${styles.sheet1}`}>
        <svg
          className={styles.sheetSvg}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path className={styles.path1} d={ARCH_PATH} />
        </svg>
      </div>
      <div className={`${styles.sheet} ${styles.sheet2}`}>
        <svg
          className={styles.sheetSvg}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path className={styles.path2} d={ARCH_PATH} />
        </svg>
      </div>
      <div className={`${styles.sheet} ${styles.sheet3}`}>
        <svg
          className={styles.sheetSvg}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path className={styles.path3} d={ARCH_PATH} />
        </svg>
      </div>
    </div>
  );
}
