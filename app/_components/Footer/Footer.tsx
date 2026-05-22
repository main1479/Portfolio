import { siteConfig } from '../../_lib/site-config';
import styles from './_Footer.module.scss';

type Props = {
  heading?: React.ReactNode;
  metaLinks?: typeof siteConfig.metaLinks;
};

export function Footer({ heading, metaLinks = siteConfig.metaLinks }: Props) {
  const [user, domain] = siteConfig.email.split('@');
  const defaultHeading = (
    <>
      {siteConfig.footerCta.lead}
      <br />
      <a href={`mailto:${siteConfig.email}`}>
        {user}
        <wbr />@{domain}
      </a>
    </>
  );

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        <div className={styles.top}>
          <h2 className={styles.cta}>{heading ?? defaultHeading}</h2>
          <div className={styles.meta}>
            {metaLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className={styles.mark} aria-hidden="true">
          {siteConfig.ownerName.split(' ')[0]}
        </div>
        <div className={styles.bottom}>
          <span>
            © {siteConfig.year} {siteConfig.ownerName}
          </span>
          <span className={styles.center}>Frontend · Experimentation</span>
          <span className={styles.right}>{siteConfig.version} · Built with care</span>
        </div>
      </div>
    </footer>
  );
}
