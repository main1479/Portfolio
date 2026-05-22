'use client';

import { useHomeState } from '../HomeShell/HomeStateContext';
import styles from './_Hero.module.scss';

export function HeroBadge() {
  const { variant, setVariant } = useHomeState();
  return (
    <button
      type="button"
      className={styles.badge}
      aria-label="Toggle headline variant"
      onClick={() => setVariant(variant === 'A' ? 'B' : 'A')}
    >
      <span className={styles.badgeSmall}>A/B</span>
      <span>Testing</span>
    </button>
  );
}
