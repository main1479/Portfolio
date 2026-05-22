import { Arrow } from '../../../_components/Arrow/Arrow';
import type { DirectLinkData } from '../../../_types/contact';
import styles from './_ContactAside.module.scss';

export function DirectLink({ data }: { data: DirectLinkData }) {
  return (
    <a
      href={data.href}
      target={data.external ? '_blank' : undefined}
      rel={data.external ? 'noopener noreferrer' : undefined}
      className={styles.direct}
      data-cursor="hover"
    >
      <span className={styles.directLabel}>{data.label}</span>
      <span className={styles.directValue}>{data.value}</span>
      <span className={styles.directArrow} aria-hidden="true">
        <Arrow size={14} strokeWidth={1.6} />
      </span>
    </a>
  );
}
