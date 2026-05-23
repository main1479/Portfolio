import type { Metadata } from 'next';
import Content, { frontmatter } from './content.mdx';
import { CaseLayout } from '../_components/case/CaseLayout';

export const metadata: Metadata = {
  title: { absolute: frontmatter.pageTitle },
  description: frontmatter.pageDescription,
  alternates: { canonical: `/work/${frontmatter.slug}` },
  openGraph: {
    type: 'article',
    url: `/work/${frontmatter.slug}`,
    title: frontmatter.pageTitle,
    description: frontmatter.pageDescription,
  },
  twitter: {
    title: frontmatter.title,
    description: frontmatter.pageDescription,
  },
};

export default function RadiusCasePage() {
  return (
    <CaseLayout frontmatter={frontmatter}>
      <Content />
    </CaseLayout>
  );
}
