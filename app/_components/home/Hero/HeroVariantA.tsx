import { HeroBadge } from './HeroBadge';
import { HeroWords } from './HeroWords';
import styles from './_Hero.module.scss';

export function HeroVariantA() {
  return (
    <>
      <div className={styles.line}>
        <h1 className={`display display-xl ${styles.h1}`}>
          <HeroWords text="Frontend" />
        </h1>
      </div>
      <div className={`${styles.line} ${styles.lineShift}`}>
        <span className="display display-xl">
          <HeroWords text="Developer" />
        </span>
        <HeroBadge />
      </div>
      <div className={styles.line}>
        <span className="display display-xl outline">
          <HeroWords text="& Experiments" />
        </span>
      </div>
    </>
  );
}
