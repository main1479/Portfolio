import Content, { frontmatter } from './content.mdx';
import { CaseLayout } from '../_components/case/CaseLayout';

export const metadata = {
  title: frontmatter.pageTitle,
  description: frontmatter.pageDescription,
};

export default function KemonDoctorCasePage() {
  return (
    <CaseLayout frontmatter={frontmatter}>
      <Content />
    </CaseLayout>
  );
}
