import type { WorkProject } from '../_types/work';

export const workProjects = [
  {
    slug: 'avsb',
    num: '01',
    title: 'AvsB',
    summary: 'An in-house, CLI-driven A/B testing platform — built from scratch.',
    tags: ['Next.js', 'TypeScript', 'ClickHouse', 'Product'],
    featured: true,
    order: 1,
    year: '2025 – Present',
    type: 'own',
  },
  {
    slug: 'kemon-doctor',
    num: '02',
    title: 'Kemon Doctor',
    summary: 'A non-profit platform helping patients in Bangladesh find trustworthy doctors.',
    tags: ['Next.js 15', 'PostgreSQL', 'Drizzle', 'Solo'],
    featured: true,
    order: 2,
    year: '2024 – Present',
    type: 'own',
  },
  {
    slug: 'client',
    num: '03',
    title: 'Client Work',
    summary: '4+ years of A/B tests and conversion experiments for ecommerce and SaaS clients.',
    tags: ['JavaScript', 'SCSS', 'Optimizely', 'Kameleoon'],
    featured: true,
    order: 3,
    type: 'client',
  },
] as const satisfies readonly WorkProject[];

export const featuredWorkProjects = workProjects.filter((p) => p.featured);
