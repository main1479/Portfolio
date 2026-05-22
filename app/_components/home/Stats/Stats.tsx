import { Stat } from './Stat';
import type { StatItem } from '../../../_types/home';
import styles from './_Stats.module.scss';

type Props = { items: readonly StatItem[] };

export function Stats({ items }: Props) {
  return (
    <div className={styles.stats}>
      {items.map((it, i) => (
        <Stat key={i} item={it} />
      ))}
    </div>
  );
}
