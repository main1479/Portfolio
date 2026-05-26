import Link from 'next/link';
import { Container } from '../../../_components/Container/Container';
import type { CaseHeroLine } from '../../../_types/case';
import styles from './_CaseHero.module.scss';

type Props = {
  /** Both optional — when both are omitted, no breadcrumb is rendered. */
  num?: string;
  breadcrumbTitle?: string;
  lines: readonly CaseHeroLine[];
  summary: string;
};

export function CaseHero({ num, breadcrumbTitle, lines, summary }: Props) {
  return (
    <header className={styles.hero}>
      <Container>
        {breadcrumbTitle && (
          <p className={styles.breadcrumb}>
            <Link href="/work">Work</Link>
            <span aria-hidden="true"> / </span>
            <span className={styles.breadcrumbCurrent}>
              {num ? `${num} — ${breadcrumbTitle}` : breadcrumbTitle}
            </span>
          </p>
        )}
        <h1 className={styles.title}>
          {lines.map((line, i) => {
            const classes = [
              styles.line,
              line.style === 'accent' ? styles.lineAccent : '',
              line.style === 'outline' ? styles.lineOutline : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <span key={i} className={classes}>
                {line.text}
                {line.trailingAccentDot && <span className={styles.dot}>.</span>}
              </span>
            );
          })}
        </h1>
        <p className={styles.summary}>{summary}</p>
      </Container>
    </header>
  );
}
