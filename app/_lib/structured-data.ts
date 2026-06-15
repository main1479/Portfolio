import type { Breadcrumb, SchemaNode } from '../_types/structured-data';
import { siteConfig } from './site-config';
import { workProjects } from './work-projects';
import { faqContent } from './faq-content';

/** Resolve a root-relative path (or pass through an absolute URL) to an absolute URL. */
function abs(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${siteConfig.siteUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Stable @id for the Person node, so other nodes can reference it. */
const PERSON_ID = `${siteConfig.siteUrl}/#person`;
const WEBSITE_ID = `${siteConfig.siteUrl}/#website`;

/** External profile URLs for `sameAs` — real profiles only (no mailto / no CV file). */
function profileLinks(): string[] {
  return siteConfig.metaLinks
    .filter((l) => l.external && l.href.startsWith('http'))
    .map((l) => l.href);
}

/** Person schema — the core identity signal for branded search + Knowledge Panel. */
export function personSchema(): SchemaNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: siteConfig.ownerName,
    url: siteConfig.siteUrl,
    image: abs('/me.jpg'),
    email: `mailto:${siteConfig.email}`,
    jobTitle: 'Frontend Developer',
    description:
      'Frontend developer specialising in A/B testing and experimentation. 4+ years shipping conversion experiments across Optimizely, AB Tasty, Kameleoon, VWO, Adobe Target and Qubit, with modern frontend on Next.js and TypeScript.',
    knowsAbout: [
      'A/B testing',
      'Conversion rate optimization',
      'Experimentation',
      'Optimizely',
      'AB Tasty',
      'Kameleoon',
      'VWO',
      'Adobe Target',
      'Qubit',
      'Next.js',
      'React',
      'TypeScript',
      'Frontend development',
    ],
    sameAs: profileLinks(),
  };
}

/** WebSite schema — ties the domain to its author. */
export function webSiteSchema(): SchemaNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: siteConfig.siteUrl,
    name: `${siteConfig.ownerName} · Portfolio`,
    inLanguage: 'en',
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
  };
}

/** BreadcrumbList schema for richer search listings. */
export function breadcrumbSchema(crumbs: readonly Breadcrumb[]): SchemaNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

/** CreativeWork schema for an individual case study, looked up by slug. */
export function creativeWorkSchema(slug: string): SchemaNode {
  const project = workProjects.find((p) => p.slug === slug);
  if (!project) {
    throw new Error(`creativeWorkSchema: no work project for slug "${slug}"`);
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    url: abs(project.href),
    image: abs(project.cover),
    keywords: [...project.tags],
    creator: { '@id': PERSON_ID },
    inLanguage: 'en',
  };
}

/** FAQPage schema built from the contact-page FAQ content. */
export function faqSchema(): SchemaNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqContent.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
