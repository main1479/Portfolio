'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './_PageCurtain.module.scss';

const SLIDE_MS = 380;
const HOLD_MS = 840;

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

export function PageCurtain() {
  const [visible, setVisible] = useState(false);
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
      setVisible(true);

      window.setTimeout(() => {
        const navigate = () => router.push(href);
        const doc = document as Document & {
          startViewTransition?: (cb: () => void) => { finished: Promise<void> };
        };
        if (typeof doc.startViewTransition === 'function') {
          doc.startViewTransition(navigate);
        } else {
          navigate();
        }

        window.setTimeout(() => {
          setVisible(false);
          window.setTimeout(() => {
            inFlight.current = false;
          }, SLIDE_MS);
        }, HOLD_MS);
      }, SLIDE_MS);
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
      event.stopPropagation();
      trigger(dest);
    };

    // Capture phase so we run before next/link's bubble-phase handler
    // (which calls preventDefault for client-side routing — that would
    // otherwise mark the event as handled before we ever saw it).
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, [trigger]);

  return (
    <div
      aria-hidden="true"
      className={`${styles.curtain} ${visible ? styles.isVisible : ''}`}
      data-state={visible ? 'visible' : 'hidden'}
    >
      <div className={`${styles.layer} ${styles.layer1}`} />
      <div className={`${styles.layer} ${styles.layer2}`} />
      <div className={`${styles.layer} ${styles.layer3}`} />
    </div>
  );
}
