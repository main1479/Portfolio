'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from '../../_lib/motion';
import styles from './_CustomCursor.module.scss';

const QUERY = '(hover: hover) and (pointer: fine)';

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

export function CustomCursor() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const pathname = usePathname();

  // Clicking a link navigates client-side, which removes the hovered element
  // without ever firing `mouseout` (the pointer never physically moved). The
  // cursor would otherwise stay stuck in its "Open" label state on the next
  // page until the visitor moves over something else. Clear it on every route
  // change; the next mouseover re-applies the right state.
  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;
    el.classList.remove(styles.isHover, styles.isLabel);
    if (labelRef.current) labelRef.current.textContent = '';
  }, [pathname]);

  useEffect(() => {
    if (!enabled) return;
    const el = cursorRef.current;
    const label = labelRef.current;
    if (!el || !label) return;

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

    const isInteractive = (target: EventTarget | null) =>
      target instanceof Element && !!target.closest('a, button, [data-cursor="hover"]');

    const labelSource = (target: EventTarget | null) =>
      target instanceof Element ? target.closest('[data-cursor-label]') : null;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onOver = (e: MouseEvent) => {
      if (isInteractive(e.target)) el.classList.add(styles.isHover);
      const source = labelSource(e.target);
      if (source) {
        const text = source.getAttribute('data-cursor-label') ?? '';
        if (reduceMotion || text === label.textContent) {
          label.textContent = text;
        } else {
          // Decode the label in rather than hard-swapping it.
          gsap.to(label, {
            duration: 0.35,
            scrambleText: { text, chars: '<>/·_', speed: 1 },
            overwrite: true,
          });
        }
        el.classList.add(styles.isLabel);
      }
    };
    const onOut = (e: MouseEvent) => {
      if (isInteractive(e.target)) el.classList.remove(styles.isHover);
      if (labelSource(e.target)) el.classList.remove(styles.isLabel);
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
  return (
    <div ref={cursorRef} className={styles.cursor} aria-hidden="true">
      <span ref={labelRef} className={styles.label} />
    </div>
  );
}
