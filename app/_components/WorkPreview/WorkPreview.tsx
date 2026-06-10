'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../_lib/motion';
import { createPreviewGL } from '../../_lib/preview-gl';
import type { WorkProject } from '../../_types/work';
import styles from './_WorkPreview.module.scss';

type Props = {
  projects: readonly WorkProject[];
  children: React.ReactNode;
};

// Floating cover that trails the cursor over the work list. The surface is a
// WebGL quad — covers ripple and RGB-split with hand speed and melt between
// rows; when a GL context can't start, the DOM image stack takes over with a
// plain crossfade. Pure decoration: portal-mounted on <body> (fixed breaks
// inside ScrollSmoother's transformed content), aria-hidden, fine-pointer only.
export function WorkPreview({ projects, children }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
          const urls = projects.map((p) => p.coverSecondary ?? p.cover);
          const glRenderer = canvasRef.current ? createPreviewGL(canvasRef.current, urls) : null;
          // No GL context: unhide the image stack and crossfade in the DOM.
          preview.classList.toggle(styles.fallback, !glRenderer);

          const xTo = gsap.quickTo(preview, 'x', { duration: 0.5, ease: 'power3.out' });
          const yTo = gsap.quickTo(preview, 'y', { duration: 0.5, ease: 'power3.out' });
          let active = -1;
          let visible = false;
          let lastX = 0;
          let lastY = 0;
          let stopCall: gsap.core.Tween | null = null;

          const setActive = (index: number) => {
            if (index === active) return;
            active = index;
            if (glRenderer) {
              glRenderer.setActive(index);
              return;
            }
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
              lastY = e.clientY;
              stopCall?.kill();
              glRenderer?.start();
              gsap.set(preview, { x: e.clientX, y: e.clientY });
              gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power3.out' });
            }
            setActive(index);
          };

          const onMove = (e: MouseEvent) => {
            if (!visible) return;
            xTo(e.clientX);
            yTo(e.clientY);
            const vx = e.clientX - lastX;
            const vy = e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;
            glRenderer?.setVelocity(vx, vy);
            // Lean into horizontal cursor velocity.
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
            // Keep rendering through the fade-out, then idle the rAF loop.
            stopCall?.kill();
            stopCall = gsap.delayedCall(0.35, () => glRenderer?.stop());
          };

          wrap.addEventListener('mouseover', onOver);
          wrap.addEventListener('mousemove', onMove, { passive: true });
          wrap.addEventListener('mouseleave', onLeave);
          return () => {
            wrap.removeEventListener('mouseover', onOver);
            wrap.removeEventListener('mousemove', onMove);
            wrap.removeEventListener('mouseleave', onLeave);
            stopCall?.kill();
            glRenderer?.destroy();
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
            <canvas ref={canvasRef} className={styles.canvas} />
            <div className={styles.shots}>
              {projects.map((p) => (
                <div key={p.slug} className={styles.shot} data-preview-img>
                  <Image src={p.coverSecondary ?? p.cover} alt="" fill sizes="340px" />
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
