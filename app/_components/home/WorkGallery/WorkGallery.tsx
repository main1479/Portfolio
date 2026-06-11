'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollSmoother } from '../../../_lib/motion';
import { Arrow } from '../../Arrow/Arrow';
import type { WorkProject } from '../../../_types/work';
import styles from './_WorkGallery.module.scss';

type Props = {
  projects: readonly WorkProject[];
  /** Count of every project on /work, shown on the closing panel. */
  totalCount: number;
};

// CSS (in the module) and JS must agree on when the gallery runs horizontally,
// so they share this exact condition.
const HORIZONTAL =
  '(min-width: 901px) and (prefers-reduced-motion: no-preference) and (pointer: fine)';

export function WorkGallery({ projects, totalCount }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const panelCount = projects.length + 1;

  useGSAP(
    () => {
      const section = sectionRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!section || !viewport || !track) return;
      const mm = gsap.matchMedia();

      mm.add(HORIZONTAL, () => {
        const distance = () => track.scrollWidth - viewport.clientWidth;
        const setBar = barRef.current ? gsap.quickSetter(barRef.current, 'scaleX') : null;

        const xTween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => '+=' + distance(),
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (st) => {
              if (counterRef.current) {
                const idx = Math.min(panelCount, Math.round(st.progress * (panelCount - 1)) + 1);
                counterRef.current.textContent = String(idx).padStart(2, '0');
              }
              setBar?.(st.progress);
            },
          },
        });

        // Covers drift sideways inside their clip as their panel crosses the
        // screen. The 1.15 scale gives the drift room; keep it in both states
        // so GSAP owns the whole transform.
        gsap.utils.toArray<HTMLElement>('[data-gallery-img]', track).forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -6, scale: 1.15 },
            {
              xPercent: 6,
              scale: 1.15,
              ease: 'none',
              scrollTrigger: {
                trigger: img.closest('[data-gallery-panel]') ?? img,
                containerAnimation: xTween,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            },
          );
        });

        // Keyboard: tabbing reaches panels that sit off-screen horizontally —
        // jump the page scroll to the spot where that panel is in view.
        const st = xTween.scrollTrigger;
        const onFocusIn = (e: FocusEvent) => {
          if (!st) return;
          const panel =
            e.target instanceof Element ? e.target.closest('[data-gallery-panel]') : null;
          if (!(panel instanceof HTMLElement)) return;
          const ratio = gsap.utils.clamp(0, 1, panel.offsetLeft / Math.max(1, distance()));
          const y = st.start + ratio * (st.end - st.start);
          const smoother = ScrollSmoother.get();
          if (smoother) smoother.scrollTo(y, false);
          else window.scrollTo(0, y);
        };
        track.addEventListener('focusin', onFocusIn);
        return () => track.removeEventListener('focusin', onFocusIn);
      });
    },
    { scope: sectionRef },
  );

  return (
    <div ref={sectionRef} className={styles.gallery}>
      <div ref={viewportRef} className={styles.viewport}>
        <div ref={trackRef} className={styles.track}>
          {projects.map((p) => (
            <Link
              key={p.slug}
              href={p.href}
              className={styles.panel}
              data-gallery-panel
              data-cursor-label="Open"
            >
              <span className={styles.ghost} aria-hidden="true">
                {p.num}
              </span>
              <span className={styles.media}>
                <Image
                  data-gallery-img
                  src={p.cover}
                  alt={p.coverAlt}
                  fill
                  sizes="(max-width: 900px) 92vw, 62vw"
                  className={styles.img}
                />
              </span>
              <span className={styles.caption}>
                <span className={styles.title}>{p.title}</span>
                <span className={styles.meta}>
                  <span className={styles.summary}>{p.metaShort}</span>
                  <span className={styles.tags}>{p.tags.slice(0, 3).join(' · ')}</span>
                </span>
                <span className={styles.arrow} aria-hidden="true">
                  <Arrow size={20} strokeWidth={1.6} />
                </span>
              </span>
            </Link>
          ))}

          <Link
            href="/work"
            className={`${styles.panel} ${styles.endPanel}`}
            data-gallery-panel
            data-cursor-label="Index"
          >
            <span className={styles.endCount}>{String(totalCount).padStart(2, '0')}</span>
            <span className={styles.endLabel}>projects, in detail</span>
            <span className={styles.endCta}>
              Work index
              <span className={styles.arrow} aria-hidden="true">
                <Arrow size={20} strokeWidth={1.6} />
              </span>
            </span>
          </Link>
        </div>

        <div className={styles.progress} aria-hidden="true">
          <span className={styles.progressCount}>
            <span ref={counterRef}>01</span> / {String(panelCount).padStart(2, '0')}
          </span>
          <div className={styles.progressTrack}>
            <div ref={barRef} className={styles.progressBar} />
          </div>
        </div>
      </div>
    </div>
  );
}
