import Link from 'next/link';
import { Arrow } from '../../../_components/Arrow/Arrow';
import type { NextCasePointer } from '../../../_types/case';
import styles from './_NextCase.module.scss';

export function NextCase({ pointer }: { pointer: NextCasePointer }) {
  return (
    <div className={styles.nextCase}>
      <Link href={`/work/${pointer.slug}`} className={styles.link} data-cursor="hover">
        <span className={styles.label}>{pointer.label}</span>
        <span className={styles.title}>{pointer.title}</span>
        <span className={styles.arrow} aria-hidden="true">
          <Arrow size={28} strokeWidth={1.4} />
        </span>
      </Link>
    </div>
  );
}
