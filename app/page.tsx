import type { Metadata } from 'next';
import { Container } from './_components/Container/Container';
import { Section } from './_components/Section/Section';
import { Reveal } from './_components/Reveal/Reveal';
import { SectionHead } from './_components/SectionHead/SectionHead';
import { TextLink } from './_components/TextLink/TextLink';
import { HomeShell } from './_components/home/HomeShell/HomeShell';
import { Hero } from './_components/home/Hero/Hero';
import { Marquee } from './_components/home/Marquee/Marquee';
import { Stats } from './_components/home/Stats/Stats';
import { Services } from './_components/home/Services/Services';
import { SelectedWork } from './_components/home/SelectedWork/SelectedWork';
import { SelectedClients } from './_components/home/SelectedClients/SelectedClients';
import { Recognition } from './_components/home/Recognition/Recognition';
import { Experience } from './_components/Experience/Experience';
import { EndCTA } from './_components/EndCTA/EndCTA';
import { Footer } from './_components/Footer/Footer';
import { homeContent } from './_lib/home-content';
import styles from './_components/home/_homePage.module.scss';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { url: '/' },
};

export default function Home() {
  return (
    <HomeShell>
      <Hero content={homeContent.hero} />
      <Marquee tokens={homeContent.marquee.tokens} />

      <Section>
        <Container>
          <Reveal>
            <Stats items={homeContent.stats} />
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <SectionHead
              index={homeContent.services.sectionIndex}
              titleNodes={
                <>
                  What I do<span className="accent">.</span>
                </>
              }
            />
          </Reveal>
          <Services items={homeContent.services.items} />
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <SectionHead
              index={homeContent.selectedWork.sectionIndex}
              titleNodes={
                <>
                  Selected work<span className="accent">.</span>
                </>
              }
            />
          </Reveal>
          <SelectedWork />
          <Reveal className={styles.selectedWorkFoot}>
            <TextLink href={homeContent.selectedWork.indexLink.href} upRight>
              {homeContent.selectedWork.indexLink.label}
            </TextLink>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <SectionHead
              index={homeContent.experience.sectionIndex}
              titleNodes={
                <>
                  Experience<span className="accent">.</span>
                </>
              }
            />
          </Reveal>
          <Experience items={homeContent.experience.items} />
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <SectionHead
              index={homeContent.selectedClients.sectionIndex}
              titleNodes={
                <>
                  Selected clients<span className="accent">.</span>
                </>
              }
            />
          </Reveal>
          <SelectedClients content={homeContent.selectedClients} />
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <SectionHead
              index={homeContent.recognition.sectionIndex}
              titleNodes={
                <>
                  Recognition<span className="accent">.</span>
                </>
              }
            />
          </Reveal>
          <Recognition content={homeContent.recognition} />
        </Container>
      </Section>

      <EndCTA content={homeContent.endCta} />
      <Footer />
    </HomeShell>
  );
}
