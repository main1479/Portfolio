import Link from 'next/link';
import { Arrow } from '../Arrow/Arrow';
import styles from './_TextLink.module.scss';

type Props = {
  href: string;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
  upRight?: boolean;
};

export function TextLink({ href, external, children, className, upRight }: Props) {
  const cls = [styles.tlink, className].filter(Boolean).join(' ');
  const isExternal = external || /^(https?:|mailto:)/.test(href);
  const arrow = upRight ? (
    <span className={styles.arrow} aria-hidden="true">
      ↗
    </span>
  ) : (
    <span className={styles.arrow} aria-hidden="true">
      <Arrow size={14} />
    </span>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        className={cls}
        target={href.startsWith('mailto:') ? undefined : '_blank'}
        rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
      >
        {children}
        {arrow}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {children}
      {arrow}
    </Link>
  );
}
