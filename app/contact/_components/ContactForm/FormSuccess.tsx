import Link from 'next/link';
import type { ContactContent } from '../../../_types/contact';
import styles from './_ContactForm.module.scss';

export function FormSuccess({ content }: { content: ContactContent['form']['success'] }) {
  return (
    <div className={styles.success} aria-live="polite">
      <h3 className={styles.successTitle}>
        {content.titleLines.map((line, i) => (
          <span key={i} className={i === content.accentLineIndex ? 'accent' : undefined}>
            {line}
            {i < content.titleLines.length - 1 && ' '}
          </span>
        ))}
      </h3>
      <p className={styles.successBody}>{content.body}</p>
      <div className={styles.successActions}>
        <Link href={content.ctaHref} className={styles.successCta}>
          {content.ctaLabel}
        </Link>
      </div>
    </div>
  );
}
