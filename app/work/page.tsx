import type { Metadata } from 'next';
import { Button } from '../_components/Button/Button';
import { Container } from '../_components/Container/Container';
import { PageIntro } from '../_components/PageIntro/PageIntro';
import { Reveal } from '../_components/Reveal/Reveal';
import { SectionHead } from '../_components/SectionHead/SectionHead';
import { Footer } from '../_components/Footer/Footer';
import { workProjects } from '../_lib/work-projects';
import { IndexRow } from './_components/IndexRow/IndexRow';
import styles from './_workPage.module.scss';

export const metadata: Metadata = {
  title: 'Work · Mainul Islam',
  description: 'A mix of experimentation platforms, products, and client experiment work.',
  alternates: { canonical: '/work' },
  openGraph: {
    type: 'website',
    url: '/work',
    title: 'Work · Mainul Islam',
    description: 'A mix of experimentation platforms, products, and client experiment work.',
  },
  twitter: {
    title: 'Work · Mainul Islam',
    description: 'A mix of experimentation platforms, products, and client experiment work.',
  },
};

export default function WorkPage() {
  return (
    <>
      <Container>
        <PageIntro
          label="02 / Work Index"
          titleNodes={
            <>
              Work,
              <br />
              <span className="accent">in detail.</span>
            </>
          }
          sub="A mix of experimentation platforms, products, and client experiment work — spanning startups and individuals across nine-plus countries."
        />
      </Container>
      <section className={styles.indexSection}>
        <Container>
          <Reveal>
            <SectionHead
              index="— Projects"
              titleNodes={
                <>
                  In order<span className="accent">.</span>
                </>
              }
            />
          </Reveal>
          <ol className={styles.index} role="list">
            {workProjects.map((project) => (
              <IndexRow key={project.slug} project={project} />
            ))}
          </ol>
          <Reveal className={styles.indexFoot}>
            <p className={styles.indexFootText}>
              Got a brief or a hypothesis you want pressure-tested?
            </p>
            <Button href="/contact" variant="accent">
              Start a conversation
            </Button>
          </Reveal>
        </Container>
      </section>
      <Footer
        heading={
          <>
            Let&rsquo;s talk —<br />
            <a href="mailto:m.main2402@gmail.com">
              m.main2402
              <wbr />
              @gmail.com
            </a>
          </>
        }
      />
    </>
  );
}
