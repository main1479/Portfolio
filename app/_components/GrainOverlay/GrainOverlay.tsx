import styles from './_GrainOverlay.module.scss';

// Static film-grain wash over the whole viewport — texture, not motion, so
// it needs no reduced-motion gate. Pointer-events off; purely decorative.
export function GrainOverlay() {
  return <div className={styles.grain} aria-hidden="true" />;
}
