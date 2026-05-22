import { Reveal } from '../../../_components/Reveal/Reveal';
import type { PersonalData } from '../../../_types/about';
import styles from './_Personal.module.scss';

export function Personal({ content }: { content: PersonalData }) {
  return (
    <Reveal className={styles.personal}>
      <h3 className={styles.heading}>
        {content.headingLines.map((line, i) => (
          <span key={i} className={i === content.accentLineIndex ? 'accent' : undefined}>
            {line}
            {i < content.headingLines.length - 1 && ' '}
          </span>
        ))}
      </h3>
      <div className={styles.body}>
        <p>{content.body}</p>
      </div>
    </Reveal>
  );
}
