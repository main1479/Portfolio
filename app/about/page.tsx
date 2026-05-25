import type { Metadata } from 'next';
import { Container } from '../_components/Container/Container';
import { Section } from '../_components/Section/Section';
import { PageIntro } from '../_components/PageIntro/PageIntro';
import { SectionHead } from '../_components/SectionHead/SectionHead';
import { Reveal } from '../_components/Reveal/Reveal';
import { Experience } from '../_components/Experience/Experience';
import { Footer } from '../_components/Footer/Footer';
import { AboutBio } from './_components/AboutBio/AboutBio';
import { Skills } from './_components/Skills/Skills';
import { Personal } from './_components/Personal/Personal';
import { ResumeCTA } from './_components/ResumeCTA/ResumeCTA';
import { aboutContent } from '../_lib/about-content';
import { homeContent } from '../_lib/home-content';
import { siteConfig } from '../_lib/site-config';
import styles from './_aboutPage.module.scss';

export const metadata: Metadata = {
  title: 'About · Mainul Islam',
  description:
    'Frontend developer working remotely since 2019. Open to full-time and contract roles. A/B testing and experimentation focus. Works with AI as a co-engineer.',
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'profile',
    url: '/about',
    title: 'About · Mainul Islam',
    description:
      'Frontend developer working remotely since 2019. Open to full-time and contract roles. A/B testing and experimentation focus. Works with AI as a co-engineer.',
  },
  twitter: {
    title: 'About · Mainul Islam',
    description:
      'Frontend developer working remotely since 2019. Open to full-time and contract roles. A/B testing and experimentation focus. Works with AI as a co-engineer.',
  },
};

export default function AboutPage() {
  const [emailUser, emailDomain] = siteConfig.email.split('@');

  return (
    <>
      <Container>
        <PageIntro
          label={aboutContent.pageIntro.label}
          titleNodes={
            <>
              {aboutContent.pageIntro.titleLines.map((line, i) => (
                <span
                  key={i}
                  className={i === aboutContent.pageIntro.accentLineIndex ? 'accent' : undefined}
                >
                  {line}
                  {i < aboutContent.pageIntro.titleLines.length - 1 && <br />}
                </span>
              ))}
            </>
          }
        />
      </Container>

      <Section className={styles.bioSection}>
        <Container>
          <AboutBio content={aboutContent.bio} />
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <SectionHead
              index={aboutContent.skills.sectionIndex}
              titleNodes={
                <>
                  {aboutContent.skills.title}
                  <span className="accent">.</span>
                </>
              }
            />
          </Reveal>
          <Skills groups={aboutContent.skills.groups} />
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <SectionHead
              index={aboutContent.experience.sectionIndex}
              titleNodes={
                <>
                  {aboutContent.experience.title}
                  <span className="accent">.</span>
                </>
              }
            />
          </Reveal>
          <Experience items={homeContent.experience.items} />
        </Container>
      </Section>

      <section>
        <Container>
          <Personal content={aboutContent.personal} />
        </Container>
      </section>

      <Section className={styles.resumeSection}>
        <Container>
          <ResumeCTA content={aboutContent.resume} />
        </Container>
      </Section>

      <Footer
        heading={
          <>
            Let&rsquo;s talk —<br />
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
