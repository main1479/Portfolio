import type { ClientItem } from '../../../_types/home';
import styles from './_SelectedClients.module.scss';

export function ClientCard({ item }: { item: ClientItem }) {
  return (
    <div className={styles.client}>
      <span className={styles.sector}>{item.sector}</span>
      <h3 className={styles.name}>
        {item.nameParts.map((part, i) => (
          <span key={i}>
            {part}
            {i < item.nameParts.length - 1 && <wbr />}
          </span>
        ))}
      </h3>
    </div>
  );
}
