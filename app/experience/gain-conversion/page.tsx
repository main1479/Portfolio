import type { Metadata } from 'next';
import Content, { frontmatter } from './content.mdx';
import { ExperienceLayout } from '../_components/ExperienceLayout/ExperienceLayout';
import { JsonLd } from '../../_components/JsonLd/JsonLd';
import { breadcrumbSchema } from '../../_lib/structured-data';

export const metadata: Metadata = {
  title: { absolute: frontmatter.pageTitle },
  description: frontmatter.pageDescription,
  alternates: { canonical: `/experience/${frontmatter.slug}` },
  openGraph: {
    type: 'article',
    url: `/experience/${frontmatter.slug}`,
    title: frontmatter.pageTitle,
    description: frontmatter.pageDescription,
  },
  twitter: {
    title: frontmatter.title,
    description: frontmatter.pageDescription,
  },
};

export default function ExperienceGainConversionPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: frontmatter.title, path: `/experience/${frontmatter.slug}` },
        ])}
      />
      <ExperienceLayout frontmatter={frontmatter}>
        <Content />
      </ExperienceLayout>
    </>
  );
}
