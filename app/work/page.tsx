import type { Metadata } from 'next';
import { Container } from '../_components/Container/Container';
import { PageIntro } from '../_components/PageIntro/PageIntro';
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
          <ol className={styles.index} role="list">
            {workProjects.map((project) => (
              <IndexRow key={project.slug} project={project} />
            ))}
          </ol>
          <p className={styles.confidentiality}>
            Client names appear only with written permission. Anything not listed here stays
            confidential — that&rsquo;s how this work has to work.
          </p>
        </Container>
      </section>
      <Footer
        heading={
          <>
            Got a project? —<br />
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
