import { Reveal } from '../../Reveal/Reveal';
import { AwardCard } from './AwardCard';
import { renderSegments } from '../Intro/Intro';
import type { HomeContent } from '../../../_types/home';
import styles from './_Recognition.module.scss';

type Props = { content: HomeContent['recognition'] };

export function Recognition({ content }: Props) {
  return (
    <>
      <Reveal as="div">
        <p className={`lede ${styles.lede}`}>{renderSegments(content.lede)}</p>
      </Reveal>
      <div className={styles.awards}>
        {content.items.map((it, i) => (
          <Reveal key={it.source} delay={(i + 1) as 1 | 2}>
            <AwardCard item={it} />
          </Reveal>
        ))}
      </div>
    </>
  );
}
