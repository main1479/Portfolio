'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import styles from './_CustomCursor.module.scss';

const QUERY = '(hover: hover) and (pointer: fine)';
const LABEL_MAX = 14;
const INTERACTIVE_SELECTOR = 'a, button, [data-cursor="hover"]';

function subscribe(cb: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

function clamp(text: string): string {
  return text.length > LABEL_MAX ? `${text.slice(0, LABEL_MAX - 1)}…` : text;
}

function resolveLabel(el: HTMLElement | null): string {
  if (!el) return '';
  const explicit = el.dataset.cursorLabel?.trim();
  if (explicit) return clamp(explicit);
  const aria = el.getAttribute('aria-label')?.trim();
  if (aria) return clamp(aria);
  const text = el.textContent?.trim();
  if (!text) return '';
  return clamp(text);
}

function closestInteractive(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>(INTERACTIVE_SELECTOR);
}

type CursorState = { hover: boolean; label: string };

export function CustomCursor() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<CursorState>({ hover: false, label: '' });

  useEffect(() => {
    if (!enabled) return;
    const el = cursorRef.current;
    if (!el) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx;
    let cy = my;
    let rafId = 0;
    let hasMoved = false;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        el.style.opacity = '1';
      }
    };
    const tick = () => {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(tick);
    };

    const onOver = (e: MouseEvent) => {
      const interactive = closestInteractive(e.target);
      if (!interactive) return;
      setState({ hover: true, label: resolveLabel(interactive) });
    };
    const onOut = (e: MouseEvent) => {
      const interactive = closestInteractive(e.target);
      if (!interactive) return;
      // If we're entering another interactive element, let its mouseover update us
      if (closestInteractive(e.relatedTarget)) return;
      setState({ hover: false, label: '' });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, [enabled]);

  if (!enabled) return null;

  const cls = [
    styles.cursor,
    state.hover && !state.label ? styles.isHover : '',
    state.label ? styles.hasLabel : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={cursorRef} className={cls} aria-hidden="true">
      <span className={styles.label}>{state.label}</span>
    </div>
  );
}
