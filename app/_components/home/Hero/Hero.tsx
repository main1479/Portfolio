'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../../_lib/motion';
import { Container } from '../../Container/Container';
import { TickRule } from '../../TickRule/TickRule';
import { Button } from '../../Button/Button';
import { useHomeState } from '../HomeShell/HomeStateContext';
import { HeroVariantA } from './HeroVariantA';
import { HeroVariantB } from './HeroVariantB';
import type { HomeContent } from '../../../_types/home';
import styles from './_Hero.module.scss';

type Props = { content: HomeContent['hero'] };

export function Hero({ content }: Props) {
  const { variant, setVariant } = useHomeState();
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
        tl.from(`.${styles.wordInner}`, { yPercent: 110, duration: 0.9, stagger: 0.06 }, 0.15);
        if (variant === 'A') {
          tl.from(`.${styles.badge}`, { opacity: 0, scale: 0.92, duration: 0.6 }, 0.7);
        }
        tl.from(`.${styles.variantToggle}`, { opacity: 0, duration: 0.6 }, 1.1);
      });
    },
    { scope: containerRef, dependencies: [variant] },
  );

  return (
    <header ref={containerRef} className={styles.hero} data-screen-label="Home Hero">
      <Container className={styles.heroInner}>
        <div className={styles.topbar}>
          <span>
            <strong>{content.topbarLeft.name}</strong> · {content.topbarLeft.role}
          </span>
          <TickRule className={styles.tickRule} />
          <div className={styles.topbarRight}>
            {content.topbarRight.version} · {content.topbarRight.year}
            <br />
            <strong>{content.topbarRight.metric}</strong>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.variantPanel}>
            {variant === 'A' ? <HeroVariantA /> : <HeroVariantB />}
          </div>

          <div className={styles.variantToggle} role="tablist" aria-label="Headline variant">
            <button
              type="button"
              role="tab"
              aria-selected={variant === 'A'}
              className={variant === 'A' ? styles.isActive : ''}
              onClick={() => setVariant('A')}
            >
              <span className={styles.dot} aria-hidden="true" />
              Variant A
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={variant === 'B'}
              className={variant === 'B' ? styles.isActive : ''}
              onClick={() => setVariant('B')}
            >
              <span className={styles.dot} aria-hidden="true" />
              Variant B
            </button>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.sub}>{content.sub}</p>
          <div className={styles.status}>
            <div className={styles.statusLine}>
              <span className={styles.live} aria-hidden="true" />
              {content.statusLine}
            </div>
            <Button href={content.ctaHref}>{content.ctaLabel}</Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
