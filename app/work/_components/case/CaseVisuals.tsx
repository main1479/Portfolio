import styles from './_CaseVisuals.module.scss';

type Slot = { caption: string; aspect?: string };

type Props =
  | { layout: 'single'; primary: Slot }
  | {
      layout: 'single-plus-secondary';
      primary: Slot;
      secondary: Slot;
      children?: React.ReactNode;
    }
  | { layout: 'triple'; items: readonly [Slot, Slot, Slot] };

export function CaseVisuals(props: Props) {
  if (props.layout === 'single') {
    return (
      <figure className={styles.single}>
        <div className={styles.slot} style={{ aspectRatio: props.primary.aspect ?? '16/10' }} />
        <figcaption className={styles.caption}>{props.primary.caption}</figcaption>
      </figure>
    );
  }
  if (props.layout === 'triple') {
    return (
      <div className={styles.triple}>
        {props.items.map((it, i) => (
          <figure key={i} className={styles.tripleItem}>
            <div className={styles.slot} style={{ aspectRatio: it.aspect ?? '3/5' }} />
            <figcaption className={styles.caption}>{it.caption}</figcaption>
          </figure>
        ))}
      </div>
    );
  }
  return (
    <div className={styles.duo}>
      <figure className={styles.duoPrimary}>
        {props.children ?? (
          <div className={styles.slot} style={{ aspectRatio: props.primary.aspect ?? '16/10' }} />
        )}
        <figcaption className={styles.caption}>{props.primary.caption}</figcaption>
      </figure>
      <figure className={styles.duoSecondary}>
        <div className={styles.slot} style={{ aspectRatio: props.secondary.aspect ?? '4/3' }} />
        <figcaption className={styles.caption}>{props.secondary.caption}</figcaption>
      </figure>
    </div>
  );
}
