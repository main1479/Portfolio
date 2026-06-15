import type { Metadata } from 'next';
import { Button } from '../_components/Button/Button';
import { Container } from '../_components/Container/Container';
import { PageIntro } from '../_components/PageIntro/PageIntro';
import { Reveal } from '../_components/Reveal/Reveal';
import { SectionHead } from '../_components/SectionHead/SectionHead';
import { Footer } from '../_components/Footer/Footer';
import { workProjects } from '../_lib/work-projects';
import { WorkPreview } from '../_components/WorkPreview/WorkPreview';
import { IndexRow } from './_components/IndexRow/IndexRow';
import { JsonLd } from '../_components/JsonLd/JsonLd';
import { breadcrumbSchema } from '../_lib/structured-data';
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
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Work', path: '/work' },
        ])}
      />
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
          sub="A mix of experimentation platforms, products, and client experiment work, spanning startups and individuals across nine-plus countries."
        />
      </Container>
      <section className={styles.indexSection} data-skew>
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
          <WorkPreview projects={workProjects}>
            <ol className={styles.index} role="list">
              {workProjects.map((project, i) => (
                <IndexRow
                  key={project.slug}
                  project={project}
                  previewIndex={i}
                  delay={Math.min(i + 1, 5) as 1 | 2 | 3 | 4 | 5}
                />
              ))}
            </ol>
          </WorkPreview>
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
