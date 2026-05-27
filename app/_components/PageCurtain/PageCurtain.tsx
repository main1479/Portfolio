'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pickCurtainMessage } from '../../_lib/curtain-messages';
import styles from './_PageCurtain.module.scss';

const SLIDE_MS = 200;
const HOLD_MS = 1200;

type CurtainState = { visible: boolean; message: string };

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

function labelFromAnchor(anchor: HTMLAnchorElement): string | undefined {
  const attr = anchor.dataset.cursorLabel?.trim();
  if (attr) return attr;
  const aria = anchor.getAttribute('aria-label')?.trim();
  if (aria) return aria;
  const text = anchor.textContent?.trim();
  if (!text) return undefined;
  return text.length > 20 ? `${text.slice(0, 18)}…` : text;
}

export function PageCurtain() {
  const [state, setState] = useState<CurtainState>({ visible: false, message: '' });
  const router = useRouter();
  const inFlight = useRef(false);

  const trigger = useCallback(
    (href: string, label?: string) => {
      if (inFlight.current) return;
      const reduceMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduceMotion) {
        router.push(href);
        return;
      }

      inFlight.current = true;
      const message = pickCurtainMessage(label);
      setState({ visible: true, message });

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
          setState((s) => ({ ...s, visible: false }));
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
      trigger(dest, labelFromAnchor(anchor));
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
      className={`${styles.curtain} ${state.visible ? styles.isVisible : ''}`}
      data-state={state.visible ? 'visible' : 'hidden'}
    >
      <span className={styles.message}>{state.message}</span>
    </div>
  );
}
