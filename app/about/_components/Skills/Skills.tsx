import { Reveal } from '../../../_components/Reveal/Reveal';
import { SkillGroup } from './SkillGroup';
import type { SkillGroupData } from '../../../_types/about';
import styles from './_Skills.module.scss';

type Props = { groups: readonly SkillGroupData[] };

export function Skills({ groups }: Props) {
  return (
    <div className={styles.skills}>
      {groups.map((g, i) => {
        const delay = ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5;
        return (
          <Reveal key={g.name} delay={delay}>
            <SkillGroup group={g} />
          </Reveal>
        );
      })}
    </div>
  );
}
