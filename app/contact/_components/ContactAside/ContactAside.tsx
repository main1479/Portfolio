import { DirectLink } from './DirectLink';
import type { ContactContent } from '../../../_types/contact';
import styles from './_ContactAside.module.scss';

export function ContactAside({ content }: { content: ContactContent['aside'] }) {
  const trimmedHeading = content.heading.replace(/\.$/, '');
  return (
    <aside className={styles.aside}>
      <h2 className={styles.heading}>
        {trimmedHeading}
        <span className="accent">.</span>
      </h2>
      <p className={styles.body}>{content.body}</p>
      <div className={styles.list}>
        {content.direct.map((d) => (
          <DirectLink key={d.label} data={d} />
        ))}
      </div>
    </aside>
  );
}
