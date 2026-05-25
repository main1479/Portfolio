'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './_Magnetic.module.scss';

type Props = {
  children: React.ReactNode;
  /** Cursor-follow multiplier 0..1. Default 0.15 (subtle). */
  strength?: number;
  /** Render as block instead of the default inline-block. */
  block?: boolean;
  className?: string;
};

export function Magnetic({ children, strength = 0.15, block = false, className }: Props) {
  const outerRef = useRef<HTMLSpanElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;

    const qx = gsap.quickTo(inner, 'x', { duration: 0.2, ease: 'power3.out' });
    const qy = gsap.quickTo(inner, 'y', { duration: 0.2, ease: 'power3.out' });

    const onMove = (e: MouseEvent) => {
      const rect = outer.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      qx(x * strength);
      qy(y * strength);
    };

    const onLeave = () => {
      gsap.to(inner, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.4)',
      });
    };

    outer.addEventListener('mousemove', onMove);
    outer.addEventListener('mouseleave', onLeave);

    return () => {
      outer.removeEventListener('mousemove', onMove);
      outer.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);

  const outerCls = [styles.outer, block ? styles.outerBlock : '', className]
    .filter(Boolean)
    .join(' ');
  const innerCls = [styles.inner, block ? styles.innerBlock : ''].filter(Boolean).join(' ');

  return (
    <span ref={outerRef} className={outerCls}>
      <span ref={innerRef} className={innerCls}>
        {children}
      </span>
    </span>
  );
}
