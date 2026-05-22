import Link from 'next/link';
import { Arrow } from '../../Arrow/Arrow';
import type { WorkProject } from '../../../_types/work';
import styles from './_SelectedWork.module.scss';

export function WorkRow({ project }: { project: WorkProject }) {
  return (
    <Link href={`/work/${project.slug}`} className={styles.row}>
      <span className={styles.num}>{project.num}</span>
      <h3 className={styles.title}>{project.title}</h3>
      <div className={styles.meta}>
        <span>{project.summary}</span>
        <span className={styles.tags}>
          {project.tags.map((tag, i) => (
            <span key={tag}>
              {tag}
              {i < project.tags.length - 1 && <span aria-hidden="true">·</span>}
            </span>
          ))}
        </span>
      </div>
      <span className={styles.arrow} aria-hidden="true">
        <Arrow size={18} strokeWidth={1.6} />
      </span>
    </Link>
  );
}
