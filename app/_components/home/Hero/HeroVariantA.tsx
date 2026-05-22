import { HeroBadge } from './HeroBadge';
import styles from './_Hero.module.scss';

export function HeroVariantA() {
  return (
    <>
      <div className={styles.line}>
        <h1 className={`display display-xl ${styles.h1}`}>
          <span className={styles.d1}>Frontend</span>
        </h1>
      </div>
      <div className={`${styles.line} ${styles.lineShift}`}>
        <span className="display display-xl">
          <span className={styles.d2}>Developer</span>
        </span>
        <HeroBadge />
      </div>
      <div className={styles.line}>
        <span className="display display-xl outline">
          <span className={styles.d3}>&amp; Experiments</span>
        </span>
      </div>
    </>
  );
}
