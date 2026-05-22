import type { ServiceItem } from '../../../_types/home';
import styles from './_Services.module.scss';

export function ServiceCard({ item }: { item: ServiceItem }) {
  return (
    <div className={styles.service}>
      <span className={styles.num}>[{item.num}]</span>
      <h3 className={styles.title}>
        {item.titleLines[0]}
        <br />
        {item.titleLines[1]}
      </h3>
      <p className={styles.desc}>{item.desc}</p>
      <div className={styles.tags}>
        {item.tags.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}
