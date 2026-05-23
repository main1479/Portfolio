import type { CountryCell } from '../../../_types/case';
import styles from './_Countries.module.scss';

export function Countries({ items }: { items: readonly CountryCell[] }) {
  return (
    <ul className={styles.countries} role="list">
      {items.map((c) => (
        <li key={c.flag} className={styles.country}>
          <span className={styles.flag}>{c.flag}</span>
          <span className={styles.name}>{c.name}</span>
        </li>
      ))}
    </ul>
  );
}
