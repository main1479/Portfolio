import Link from 'next/link';
import type { XpItem } from '../../_types/home';
import styles from './_Experience.module.scss';

export function XpRow({ item }: { item: XpItem }) {
  const body = (
    <>
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
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={`${styles.row} ${styles.rowLink}`}
        aria-label={`Read about my time as ${item.roleLines.join(' ')}${item.at ? ` ${item.at}` : ''}`}
      >
        {body}
      </Link>
    );
  }
  return <div className={styles.row}>{body}</div>;
}
