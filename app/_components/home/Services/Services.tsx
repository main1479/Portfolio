import { Reveal } from '../../Reveal/Reveal';
import { ServiceCard } from './ServiceCard';
import type { ServiceItem } from '../../../_types/home';
import styles from './_Services.module.scss';

type Props = { items: readonly ServiceItem[] };

export function Services({ items }: Props) {
  return (
    <div className={styles.services}>
      {items.map((it, i) => (
        <Reveal key={it.num} delay={(i + 1) as 1 | 2 | 3}>
          <ServiceCard item={it} />
        </Reveal>
      ))}
    </div>
  );
}
