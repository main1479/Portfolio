import { Reveal } from '../../Reveal/Reveal';
import type { HomeContent, IntroSegment } from '../../../_types/home';
import styles from './_Intro.module.scss';

type Props = { content: HomeContent['intro'] };

export function renderSegments(segments: ReadonlyArray<IntroSegment>) {
  return segments.map((seg, i) => {
    if (seg.kind === 'strong') return <strong key={i}>{seg.value}</strong>;
    if (seg.kind === 'accent')
      return (
        <span key={i} className={styles.accent}>
          {seg.value}
        </span>
      );
    return <span key={i}>{seg.value}</span>;
  });
}

export function Intro({ content }: Props) {
  return (
    <div className={styles.grid}>
      <Reveal className={styles.label}>
        {content.label}
        <br />
        <span className={styles.indexLabel}>{content.indexLabel}</span>
      </Reveal>
      <Reveal className={styles.body} delay={1}>
        {content.paragraphs.map((para, i) => (
          <p key={i}>{renderSegments(para)}</p>
        ))}
      </Reveal>
    </div>
  );
}
