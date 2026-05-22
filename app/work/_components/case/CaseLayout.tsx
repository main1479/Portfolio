import { Container } from '../../../_components/Container/Container';
import { Footer } from '../../../_components/Footer/Footer';
import { CaseHero } from './CaseHero';
import { CaseMeta } from './CaseMeta';
import { NextCase } from './NextCase';
import { getNextCase } from '../../../_lib/case-registry';
import { validateFrontmatter } from './case-frontmatter-schema';
import type { CaseFrontmatter } from '../../../_types/case';
import styles from './_CaseLayout.module.scss';

type Props = {
  frontmatter: CaseFrontmatter;
  children: React.ReactNode;
};

export function CaseLayout({ frontmatter, children }: Props) {
  const fm = validateFrontmatter(frontmatter) as CaseFrontmatter;

  if (process.env.NODE_ENV !== 'production') {
    const registered = getNextCase(fm.slug);
    if (registered.slug !== fm.next.slug) {
      // eslint-disable-next-line no-console
      console.warn(
        `Case "${fm.slug}" frontmatter.next.slug (${fm.next.slug}) disagrees with case-registry (${registered.slug}).`,
      );
    }
  }

  return (
    <>
      <CaseHero num={fm.num} breadcrumbTitle={fm.title} lines={fm.heroLines} summary={fm.summary} />
      <Container>
        <CaseMeta cells={fm.meta} />
      </Container>
      <div className={styles.body}>
        <Container>{children}</Container>
      </div>
      <Container>
        <NextCase pointer={fm.next} />
      </Container>
      <Footer
        heading={
          <>
            {fm.footerHeading} —<br />
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
