import { Container } from '../../Container/Container';
import { Reveal } from '../../Reveal/Reveal';
import { Button } from '../../Button/Button';
import type { HomeContent } from '../../../_types/home';
import styles from './_EndCTA.module.scss';

type Props = { content: HomeContent['endCta'] };

export function EndCTA({ content }: Props) {
  return (
    <section className={styles.endcta} data-screen-label="End CTA">
      <Container>
        <div className={styles.inner}>
          <Reveal as="header">
            <h2 className={styles.heading}>
              {content.headingLines.map((line, i) => (
                <span key={i}>
                  <span className={line.variant === 'outline' ? styles.outline : undefined}>
                    {line.text}
                  </span>
                  {i < content.headingLines.length - 1 && <br />}
                </span>
              ))}
            </h2>
          </Reveal>
          <Reveal className={styles.sub} delay={1}>
            <p>{content.sub}</p>
            <Button href={content.ctaHref} variant="accent">
              {content.ctaLabel}
            </Button>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
