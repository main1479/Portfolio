import type { SkillGroupData } from '../../../_types/about';
import styles from './_Skills.module.scss';

export function SkillGroup({ group }: { group: SkillGroupData }) {
  return (
    <div className={styles.group}>
      <h3 className={styles.groupName}>{group.name}</h3>
      <div className={styles.tags}>
        {group.tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
