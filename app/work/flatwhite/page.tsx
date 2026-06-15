import type { Metadata } from 'next';
import Content, { frontmatter } from './content.mdx';
import { CaseLayout } from '../_components/case/CaseLayout';
import { JsonLd } from '../../_components/JsonLd/JsonLd';
import { breadcrumbSchema, creativeWorkSchema } from '../../_lib/structured-data';

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

export default function FlatwhiteCasePage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Work', path: '/work' },
            { name: frontmatter.title, path: `/work/${frontmatter.slug}` },
          ]),
          creativeWorkSchema(frontmatter.slug),
        ]}
      />
      <CaseLayout frontmatter={frontmatter}>
        <Content />
      </CaseLayout>
    </>
  );
}
