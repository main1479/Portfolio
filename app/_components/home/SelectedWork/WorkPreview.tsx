'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../../_lib/motion';
import type { WorkProject } from '../../../_types/work';
import styles from './_WorkPreview.module.scss';

type Props = {
  projects: readonly WorkProject[];
  children: React.ReactNode;
};

// Floating image that trails the cursor over the work list and swaps shots
// as you move between rows. Pure decoration: portal-mounted on <body> (fixed
// positioning breaks inside ScrollSmoother's transformed content), hidden
// from assistive tech, desktop fine-pointer only.
export function WorkPreview({ projects, children }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target (document.body) only exists client-side
    setMounted(true);
  }, []);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const preview = previewRef.current;
      if (!wrap || !preview) return;
      const mm = gsap.matchMedia();

      mm.add(
        '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
        () => {
          const shots = Array.from(preview.querySelectorAll<HTMLElement>('[data-preview-img]'));
          const xTo = gsap.quickTo(preview, 'x', { duration: 0.5, ease: 'power3.out' });
          const yTo = gsap.quickTo(preview, 'y', { duration: 0.5, ease: 'power3.out' });
          let active = -1;
          let visible = false;
          let lastX = 0;

          const setActive = (index: number) => {
            if (index === active) return;
            active = index;
            shots.forEach((shot, i) => {
              gsap.to(shot, {
                autoAlpha: i === index ? 1 : 0,
                yPercent: i === index ? 0 : 6,
                duration: 0.35,
                ease: 'power2.out',
                overwrite: true,
              });
            });
          };

          const onOver = (e: MouseEvent) => {
            const row =
              e.target instanceof Element ? e.target.closest('[data-preview-index]') : null;
            if (!row) return;
            const index = Number(row.getAttribute('data-preview-index'));
            if (Number.isNaN(index)) return;
            if (!visible) {
              visible = true;
              lastX = e.clientX;
              gsap.set(preview, { x: e.clientX, y: e.clientY });
              gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power3.out' });
            }
            setActive(index);
          };

          const onMove = (e: MouseEvent) => {
            if (!visible) return;
            xTo(e.clientX);
            yTo(e.clientY);
            // Lean into horizontal cursor velocity.
            const vx = e.clientX - lastX;
            lastX = e.clientX;
            gsap.to(preview, {
              rotation: gsap.utils.clamp(-8, 8, vx * 0.5),
              duration: 0.45,
              ease: 'power3.out',
            });
          };

          const onLeave = () => {
            visible = false;
            active = -1;
            gsap.to(preview, {
              autoAlpha: 0,
              scale: 0.92,
              rotation: 0,
              duration: 0.3,
              ease: 'power2.out',
            });
          };

          wrap.addEventListener('mouseover', onOver);
          wrap.addEventListener('mousemove', onMove, { passive: true });
          wrap.addEventListener('mouseleave', onLeave);
          return () => {
            wrap.removeEventListener('mouseover', onOver);
            wrap.removeEventListener('mousemove', onMove);
            wrap.removeEventListener('mouseleave', onLeave);
          };
        },
      );
    },
    { scope: wrapRef, dependencies: [mounted] },
  );

  return (
    <div ref={wrapRef}>
      {children}
      {mounted &&
        createPortal(
          <div ref={previewRef} className={styles.preview} aria-hidden="true">
            {projects.map((p) => (
              <div key={p.slug} className={styles.shot} data-preview-img>
                <Image src={p.coverSecondary ?? p.cover} alt="" fill sizes="340px" />
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
