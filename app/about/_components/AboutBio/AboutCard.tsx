import type { AboutCardData } from '../../../_types/about';
import styles from './_AboutBio.module.scss';

export function AboutCard({ card }: { card: AboutCardData }) {
  return (
    <div className={styles.card}>
      <span className={styles.cardLabel}>{card.label}</span>
      <span className={styles.cardValue}>
        {card.lines.map((line, i) => (
          <span key={i} className={i === card.accentLineIndex ? 'accent' : undefined}>
            {line}
            {i < card.lines.length - 1 && <br />}
          </span>
        ))}
      </span>
    </div>
  );
}
