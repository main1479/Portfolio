import { HeroWords } from './HeroWords';
import styles from './_Hero.module.scss';

export function HeroVariantB() {
  return (
    <>
      <div className={styles.line}>
        <h1 className={`display display-xl ${styles.h1}`}>
          <HeroWords text="Turning" />
        </h1>
      </div>
      <div className={`${styles.line} ${styles.lineShift}`}>
        <span className="display display-xl">
          <HeroWords text="Traffic into" />
        </span>
      </div>
      <div className={styles.line}>
        <span className="display display-xl">
          <span className={styles.accent}>
            <HeroWords text="Revenue." />
          </span>
        </span>
      </div>
    </>
  );
}
