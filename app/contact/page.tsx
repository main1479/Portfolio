import type { Metadata } from 'next';
import { Container } from '../_components/Container/Container';
import { Section } from '../_components/Section/Section';
import { PageIntro } from '../_components/PageIntro/PageIntro';
import { SectionHead } from '../_components/SectionHead/SectionHead';
import { Reveal } from '../_components/Reveal/Reveal';
import { Footer } from '../_components/Footer/Footer';
import { ContactAside } from './_components/ContactAside/ContactAside';
import { ContactForm } from './_components/ContactForm/ContactForm';
import { FAQ } from './_components/FAQ/FAQ';
import { contactContent } from '../_lib/contact-content';
import { faqContent } from '../_lib/faq-content';
import { siteConfig } from '../_lib/site-config';
import styles from './_contactPage.module.scss';

export const metadata: Metadata = {
  title: 'Contact · Mainul Islam',
  description:
    'Available for new A/B testing and frontend projects. Send a message or email directly.',
  alternates: { canonical: '/contact' },
  openGraph: {
    type: 'website',
    url: '/contact',
    title: 'Contact · Mainul Islam',
    description:
      'Available for new A/B testing and frontend projects. Send a message or email directly.',
  },
  twitter: {
    title: 'Contact · Mainul Islam',
    description:
      'Available for new A/B testing and frontend projects. Send a message or email directly.',
  },
};

export default function ContactPage() {
  const [emailUser, emailDomain] = siteConfig.email.split('@');

  return (
    <>
      <PageIntro
        label={contactContent.pageIntro.label}
        titleNodes={
          <>
            {contactContent.pageIntro.titleLines.map((line, i) => (
              <span
                key={i}
                className={i === contactContent.pageIntro.accentLineIndex ? 'accent' : undefined}
              >
                {line}
                {i < contactContent.pageIntro.titleLines.length - 1 && <br />}
              </span>
            ))}
          </>
        }
        sub={contactContent.pageIntro.sub}
      />

      <Section className={styles.formSection}>
        <Container>
          <div className={styles.grid}>
            <Reveal>
              <ContactAside content={contactContent.aside} />
            </Reveal>
            <Reveal delay={1}>
              <ContactForm content={contactContent.form} />
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section>
        <Container narrow>
          <Reveal>
            <SectionHead
              index={contactContent.faq.sectionIndex}
              titleNodes={
                <>
                  {contactContent.faq.title}
                  <span className="accent">.</span>
                </>
              }
            />
          </Reveal>
          <Reveal>
            <FAQ items={faqContent} />
          </Reveal>
        </Container>
      </Section>

      <Footer
        heading={
          <>
            Or just say hi —<br />
            <a href={`mailto:${siteConfig.email}`}>
              {emailUser}
              <wbr />@{emailDomain}
            </a>
          </>
        }
      />
    </>
  );
}
