import { Container } from '../../../_components/Container/Container';
import { Footer } from '../../../_components/Footer/Footer';
import { CaseHero } from '../../../work/_components/case/CaseHero';
import { CaseMeta } from '../../../work/_components/case/CaseMeta';
import type { ExperienceFrontmatter } from '../../../_types/experience';
import { validateExperienceFrontmatter } from './experience-frontmatter-schema';
import styles from './_ExperienceLayout.module.scss';

type Props = {
  frontmatter: ExperienceFrontmatter;
  children: React.ReactNode;
};

export function ExperienceLayout({ frontmatter, children }: Props) {
  const fm = validateExperienceFrontmatter(frontmatter) as ExperienceFrontmatter;

  return (
    <>
      <CaseHero lines={fm.heroLines} summary={fm.summary} />
      <Container>
        <CaseMeta cells={fm.meta} />
      </Container>
      <div className={styles.body}>
        <Container>{children}</Container>
      </div>
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
