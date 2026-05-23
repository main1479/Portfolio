import Image from 'next/image';
import styles from './_CaseVisuals.module.scss';

type Slot = {
  caption: string;
  aspect?: string;
  /** Path under /public, e.g. `/work/radius/share.png`. When set, renders next/image; otherwise a striped placeholder. */
  src?: string;
  /** Alt text for the image. Falls back to the caption. */
  alt?: string;
};

type Props =
  | { layout: 'single'; primary: Slot }
  | {
      layout: 'single-plus-secondary';
      primary: Slot;
      secondary: Slot;
      children?: React.ReactNode;
    }
  | { layout: 'triple'; items: readonly [Slot, Slot, Slot] };

function SlotMedia({ slot, defaultAspect }: { slot: Slot; defaultAspect: string }) {
  const aspect = slot.aspect ?? defaultAspect;
  if (slot.src) {
    return (
      <div className={styles.slotMedia} style={{ aspectRatio: aspect }}>
        <Image
          src={slot.src}
          alt={slot.alt ?? slot.caption}
          fill
          sizes="(max-width: 900px) 100vw, 50vw"
          className={styles.slotImage}
        />
      </div>
    );
  }
  return <div className={styles.slot} style={{ aspectRatio: aspect }} />;
}

export function CaseVisuals(props: Props) {
  if (props.layout === 'single') {
    return (
      <figure className={styles.single}>
        <SlotMedia slot={props.primary} defaultAspect="16/10" />
        <figcaption className={styles.caption}>{props.primary.caption}</figcaption>
      </figure>
    );
  }
  if (props.layout === 'triple') {
    return (
      <div className={styles.triple}>
        {props.items.map((it, i) => (
          <figure key={i} className={styles.tripleItem}>
            <SlotMedia slot={it} defaultAspect="3/5" />
            <figcaption className={styles.caption}>{it.caption}</figcaption>
          </figure>
        ))}
      </div>
    );
  }
  return (
    <div className={styles.duo}>
      <figure className={styles.duoPrimary}>
        {props.children ?? <SlotMedia slot={props.primary} defaultAspect="16/10" />}
        <figcaption className={styles.caption}>{props.primary.caption}</figcaption>
      </figure>
      <figure className={styles.duoSecondary}>
        <SlotMedia slot={props.secondary} defaultAspect="4/3" />
        <figcaption className={styles.caption}>{props.secondary.caption}</figcaption>
      </figure>
    </div>
  );
}
