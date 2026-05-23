import type { CaseMetaCell } from '../../../_types/case';
import styles from './_CaseMeta.module.scss';

export function CaseMeta({ cells }: { cells: readonly CaseMetaCell[] }) {
  return (
    <dl className={styles.meta}>
      {cells.map((cell) => (
        <div key={cell.label} className={styles.cell}>
          <dt className={styles.label}>{cell.label}</dt>
          <dd className={styles.value}>
            {cell.accentDot && <span className={styles.dot} aria-hidden="true" />}
            {cell.value.split('\n').map((segment, i, arr) => (
              <span key={i}>
                {segment}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
