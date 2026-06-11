import styles from './_RollingText.module.scss';

type Props = {
  className?: string;
  children: React.ReactNode;
};

// Split-flap link hover: two stacked copies in a clip box; hovering or
// focusing the parent link rolls the stack up one line. Pure CSS — the
// duplicate copy is hidden from assistive tech.
export function RollingText({ className, children }: Props) {
  return (
    <span className={[styles.roll, className].filter(Boolean).join(' ')}>
      <span className={styles.line}>{children}</span>
      <span className={`${styles.line} ${styles.under}`} aria-hidden="true">
        {children}
      </span>
    </span>
  );
}
