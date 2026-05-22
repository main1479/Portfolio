import type { XpItem } from '../../_types/home';
import styles from './_Experience.module.scss';

export function XpRow({ item }: { item: XpItem }) {
  return (
    <div className={styles.row}>
      <div className={styles.year}>{item.year}</div>
      <h3 className={styles.role}>
        {item.roleLines.map((line, i) => (
          <span key={i}>
            {line}
            {i < item.roleLines.length - 1 && <br />}
          </span>
        ))}
        {item.at && (
          <>
            <br />
            <span className={styles.at}>{item.at}</span>
          </>
        )}
      </h3>
      <p className={styles.desc}>{item.desc}</p>
      <div className={styles.loc}>{item.loc}</div>
    </div>
  );
}
