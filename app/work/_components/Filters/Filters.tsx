'use client';

import styles from './_Filters.module.scss';
import type { WorkFilterValue } from '../../../_lib/work-projects';

type Props = {
  filters: readonly { value: WorkFilterValue; label: string }[];
  active: WorkFilterValue;
  onChange: (value: WorkFilterValue) => void;
  count: number;
};

export function Filters({ filters, active, onChange, count }: Props) {
  return (
    <div className={styles.filters} role="toolbar" aria-label="Filter projects">
      <span className={styles.label}>Filter</span>
      <div className={styles.chips}>
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`${styles.chip} ${active === f.value ? styles.chipActive : ''}`}
            aria-pressed={active === f.value}
            onClick={() => onChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <span className={styles.count}>
        <span aria-live="polite">{String(count).padStart(2, '0')}</span> projects
      </span>
    </div>
  );
}
