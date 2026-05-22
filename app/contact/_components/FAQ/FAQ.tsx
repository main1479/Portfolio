import type { FaqItem } from '../../../_types/contact';
import styles from './_FAQ.module.scss';

type Props = { items: readonly FaqItem[] };

export function FAQ({ items }: Props) {
  return (
    <div className={styles.faq}>
      {items.map((item, i) => (
        <details key={i} className={styles.item}>
          <summary>
            <span>{item.question}</span>
            <span className={styles.plus} aria-hidden="true" />
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
