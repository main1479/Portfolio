import styles from './_Hero.module.scss';

export function HeroVariantB() {
  return (
    <>
      <div className={styles.line}>
        <h1 className={`display display-xl ${styles.h1}`}>
          <span className={styles.d1}>Turning</span>
        </h1>
      </div>
      <div className={`${styles.line} ${styles.lineShift}`}>
        <span className="display display-xl">
          <span className={styles.d2}>Traffic into</span>
        </span>
      </div>
      <div className={styles.line}>
        <span className="display display-xl">
          <span className={`${styles.d3} ${styles.accent}`}>Revenue.</span>
        </span>
      </div>
    </>
  );
}
