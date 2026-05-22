import { Reveal } from '../../../_components/Reveal/Reveal';
import styles from './_CaseBlock.module.scss';

type Props = {
  num: string;
  label: string;
  heading: string;
  accentDot?: boolean;
  children: React.ReactNode;
};

export function CaseBlock({ num, label, heading, accentDot = true, children }: Props) {
  return (
    <Reveal as="section" className={styles.block}>
      <div className={styles.side}>
        <span className={styles.num}>{num}</span>
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.body}>
        <h2 className={styles.heading}>
          {heading}
          {accentDot && <span className={styles.dot}>.</span>}
        </h2>
        <div className={styles.content}>{children}</div>
      </div>
    </Reveal>
  );
}
