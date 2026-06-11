import styles from './_BrowserFrame.module.scss';

type Props = {
  /** Short context label shown in the chrome bar, e.g. the product or page name. */
  label?: string;
  children: React.ReactNode;
};

// Minimal browser chrome around a screenshot so raw captures read as
// composed shots instead of flat pastes.
export function BrowserFrame({ label, children }: Props) {
  return (
    <div className={styles.frame}>
      <div className={styles.bar} aria-hidden="true">
        <span className={styles.dots}>
          <span />
          <span />
          <span />
        </span>
        {label && <span className={styles.label}>{label}</span>}
      </div>
      <div className={styles.viewport}>{children}</div>
    </div>
  );
}
