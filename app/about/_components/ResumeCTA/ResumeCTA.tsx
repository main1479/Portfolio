import { Reveal } from '../../../_components/Reveal/Reveal';
import { Button } from '../../../_components/Button/Button';
import type { ResumeCtaData } from '../../../_types/about';
import styles from './_ResumeCTA.module.scss';

export function ResumeCTA({ content }: { content: ResumeCtaData }) {
  return (
    <Reveal className={styles.resume}>
      <div className={styles.copy}>
        <h3 className={styles.title}>
          {content.headingLines.map((line, i) => (
            <span key={i} className={i === content.accentLineIndex ? 'accent' : undefined}>
              {line}
              {i < content.headingLines.length - 1 && <br />}
            </span>
          ))}
        </h3>
        <p className={styles.sub}>{content.sub}</p>
      </div>
      <Button
        href={content.ctaHref}
        external
        variant="accent"
        className={styles.cta}
        arrowGlyph={<span aria-hidden="true">↓</span>}
      >
        {content.ctaLabel}
      </Button>
    </Reveal>
  );
}
