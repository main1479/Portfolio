import { Reveal } from '../Reveal/Reveal';
import { XpRow } from './XpRow';
import type { XpItem } from '../../_types/home';
import styles from './_Experience.module.scss';

type Props = { items: readonly XpItem[] };

export function Experience({ items }: Props) {
  return (
    <div className={styles.list}>
      {items.map((it, i) => (
        <Reveal key={it.year + (it.at ?? '')} delay={(i + 1) as 1 | 2}>
          <XpRow item={it} />
        </Reveal>
      ))}
    </div>
  );
}
