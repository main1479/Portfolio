import { AboutAvatar } from './AboutAvatar';
import { AboutCard } from './AboutCard';
import { Reveal } from '../../../_components/Reveal/Reveal';
import { StickyPin } from '../../../_components/StickyPin/StickyPin';
import type { AboutContent, BioParagraph } from '../../../_types/about';
import styles from './_AboutBio.module.scss';

type Props = { content: AboutContent['bio'] };

export function AboutBio({ content }: Props) {
  return (
    <div className={styles.bio}>
      <StickyPin className={styles.side}>
        <Reveal className={styles.sideInner}>
          <AboutAvatar tag={content.portraitTag} alt={content.portraitAlt} />
          {content.cards.map((card, i) => (
            <AboutCard key={i} card={card} />
          ))}
        </Reveal>
      </StickyPin>
      <Reveal delay={1} className={styles.body}>
        {content.paragraphs.map((para, i) => (
          <p key={i}>{renderBioSegments(para)}</p>
        ))}
      </Reveal>
    </div>
  );
}

function renderBioSegments(para: BioParagraph) {
  return para.map((seg, i) => {
    switch (seg.kind) {
      case 'strong':
        return <strong key={i}>{seg.value}</strong>;
      case 'accent':
        return (
          <span key={i} className="accent">
            {seg.value}
          </span>
        );
      case 'em':
        return <em key={i}>{seg.value}</em>;
      default:
        return <span key={i}>{seg.value}</span>;
    }
  });
}
