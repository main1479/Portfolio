import type { IntroSegment } from '../../../_types/home';
import styles from './_Segments.module.scss';

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
