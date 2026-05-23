import Image from 'next/image';
import styles from './_CaseVisuals.module.scss';

export type CaseVisualSlot = {
  src?: string;
  alt?: string;
  caption: string;
  /** In a 2-item duo, designates which slot is the larger primary vs. the smaller secondary.
   *  Ignored when there's 1 or 3 items. If both items omit `type`, the first is primary. */
  type?: 'primary' | 'secondary';
};

type Props = {
  items: readonly CaseVisualSlot[];
  /** Replaces the primary slot's media — used by AvsB to slot a CodeMock in place of an image. */
  children?: React.ReactNode;
};

const ASPECT = {
  single: '16/10',
  primary: '16/10',
  secondary: '4/3',
  triple: '3/5',
} as const;

function SlotMedia({
  slot,
  aspect,
  override,
}: {
  slot: CaseVisualSlot;
  aspect: string;
  override?: React.ReactNode;
}) {
  if (override) return <>{override}</>;
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

export function CaseVisuals({ items, children }: Props) {
  if (items.length === 0) return null;

  if (items.length === 1) {
    const [slot] = items;
    return (
      <figure className={styles.single}>
        <SlotMedia slot={slot} aspect={ASPECT.single} override={children} />
        <figcaption className={styles.caption}>{slot.caption}</figcaption>
      </figure>
    );
  }

  if (items.length === 2) {
    const explicitPrimary = items.findIndex((s) => s.type === 'primary');
    const pIdx = explicitPrimary === -1 ? 0 : explicitPrimary;
    const primary = items[pIdx];
    const secondary = items[pIdx === 0 ? 1 : 0];

    return (
      <div className={styles.duo}>
        <figure className={styles.duoPrimary}>
          <SlotMedia slot={primary} aspect={ASPECT.primary} override={children} />
          <figcaption className={styles.caption}>{primary.caption}</figcaption>
        </figure>
        <figure className={styles.duoSecondary}>
          <SlotMedia slot={secondary} aspect={ASPECT.secondary} />
          <figcaption className={styles.caption}>{secondary.caption}</figcaption>
        </figure>
      </div>
    );
  }

  return (
    <div className={styles.triple}>
      {items.slice(0, 3).map((slot, i) => (
        <figure key={i} className={styles.tripleItem}>
          <SlotMedia slot={slot} aspect={ASPECT.triple} />
          <figcaption className={styles.caption}>{slot.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
