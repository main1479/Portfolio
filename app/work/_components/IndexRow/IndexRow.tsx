import Link from 'next/link';
import { Arrow } from '../../../_components/Arrow/Arrow';
import { Reveal } from '../../../_components/Reveal/Reveal';
import type { WorkProject } from '../../../_types/work';
import styles from './_IndexRow.module.scss';

type RevealDelay = 1 | 2 | 3 | 4 | 5;

type Props = {
  project: WorkProject;
  delay?: RevealDelay;
};

export function IndexRow({ project, delay }: Props) {
  const visibleTags = project.tags.slice(0, 3);
  return (
    <Reveal as="li" delay={delay} className={styles.row}>
      <Link
        href={project.href}
        className={styles.link}
        data-cursor="hover"
        data-cursor-label="Open"
      >
        <span className={styles.num}>{project.num}</span>
        <h3 className={styles.title}>{project.title}</h3>
        <span className={styles.meta}>{project.metaShort}</span>
        <span className={styles.tags}>
          {visibleTags.map((tag, i) => (
            <span key={tag} className={styles.tag}>
              {tag}
              {i < visibleTags.length - 1 && <span aria-hidden="true"> ·</span>}
            </span>
          ))}
        </span>
        <span className={styles.year}>{project.yearStatus ?? project.year ?? ''}</span>
        <span className={styles.arrow} aria-hidden="true">
          <Arrow size={16} strokeWidth={1.6} />
        </span>
      </Link>
    </Reveal>
  );
}
