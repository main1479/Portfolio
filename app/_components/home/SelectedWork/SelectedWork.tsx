import { Reveal } from '../../Reveal/Reveal';
import { WorkRow } from './WorkRow';
import { WorkPreview } from './WorkPreview';
import { featuredWorkProjects } from '../../../_lib/work-projects';
import styles from './_SelectedWork.module.scss';

export function SelectedWork() {
  return (
    <WorkPreview projects={featuredWorkProjects}>
      <div className={styles.list}>
        {featuredWorkProjects.map((p, i) => (
          <Reveal key={p.slug} delay={(i + 1) as 1 | 2 | 3 | 4 | 5}>
            <WorkRow project={p} previewIndex={i} />
          </Reveal>
        ))}
      </div>
    </WorkPreview>
  );
}
