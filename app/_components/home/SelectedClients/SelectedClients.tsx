import { Reveal } from '../../Reveal/Reveal';
import { ClientCard } from './ClientCard';
import { renderSegments } from '../Segments/Segments';
import type { HomeContent } from '../../../_types/home';
import styles from './_SelectedClients.module.scss';

type Props = { content: HomeContent['selectedClients'] };

export function SelectedClients({ content }: Props) {
  return (
    <>
      <Reveal as="div">
        <p className={styles.intro}>{renderSegments(content.intro)}</p>
      </Reveal>
      <Reveal as="div" delay={1}>
        <div className={styles.grid}>
          {content.items.map((c) => (
            <ClientCard key={c.sector + c.nameParts.join('')} item={c} />
          ))}
        </div>
      </Reveal>
      <Reveal as="div">
        <p className={styles.foot}>{content.foot}</p>
      </Reveal>
    </>
  );
}
