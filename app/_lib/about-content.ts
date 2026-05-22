import type { AboutContent } from '../_types/about';
import { siteConfig } from './site-config';

// TODO Phase 7: replace this with a local '/cv.pdf' once the self-hosted PDF lands.
const cvHref =
  siteConfig.metaLinks.find((link) => link.label.startsWith('Resume'))?.href ??
  'https://drive.google.com/file/d/1zp7JQLgPNyEQan9bzKnLN2i-t1Du_tgI/view';

export const aboutContent = {
  pageIntro: {
    label: '03 / About',
    titleLines: ['A frontend dev,', 'measuring his work.'],
    accentLineIndex: 1,
  },
  bio: {
    portraitAlt: 'Mainul Islam, photographed in 2026.',
    portraitTag: 'Mainul Islam, 2026',
    cards: [
      {
        label: 'Currently',
        lines: ['Available for', 'new projects'],
        accentLineIndex: 1,
      },
      {
        label: 'Focus',
        lines: ['A/B Testing', '& Frontend'],
      },
    ],
    paragraphs: [
      [
        { kind: 'text', value: "I'm a " },
        { kind: 'strong', value: 'frontend developer' },
        { kind: 'text', value: ' working remotely since 2019.' },
      ],
      [
        {
          kind: 'text',
          value:
            'My focus is the place where good frontend meets measurable results: building reliable ',
        },
        { kind: 'accent', value: 'A/B tests and conversion experiments' },
        { kind: 'text', value: ' for real businesses.' },
      ],
      [
        {
          kind: 'text',
          value:
            'I started in freelance frontend work and moved steadily toward experimentation — the part of the job where you can ',
        },
        { kind: 'em', value: 'prove' },
        {
          kind: 'text',
          value: ' whether a change actually worked. Over the last few years, that adds up to ',
        },
        { kind: 'strong', value: '500+ A/B tests shipped' },
        { kind: 'text', value: ' across ecommerce and SaaS.' },
      ],
      [
        {
          kind: 'text',
          value: 'For the last few years, most of my time went into a long-running contract with ',
        },
        { kind: 'strong', value: 'Conversion.com' },
        {
          kind: 'text',
          value:
            ", building A/B tests on enterprise platforms. That work has wound down, and I'm now ",
        },
        { kind: 'strong', value: 'actively taking on new clients' },
        { kind: 'text', value: ' — experimentation programmes, frontend builds, or both.' },
      ],
      [
        {
          kind: 'text',
          value:
            "I've worked with startups and individuals across the UK, India, Slovakia, Austria, Australia, and Canada.",
        },
      ],
    ],
  },
  skills: {
    sectionIndex: '— Stack & Skills',
    title: 'What I build with',
    groups: [
      { name: 'Core', tags: ['JavaScript', 'TypeScript', 'React', 'Next.js'] },
      { name: 'Styling', tags: ['SCSS', 'Tailwind', 'Modern CSS'] },
      { name: 'Experimentation', tags: ['Optimizely', 'Kameleoon', 'Qubit', 'CRO'] },
      { name: 'Tooling & Testing', tags: ['Vitest', 'Playwright', 'Git', 'Turborepo'] },
      { name: 'Also working with', tags: ['PostgreSQL', 'Drizzle ORM', 'Node.js', 'ClickHouse'] },
    ],
  },
  experience: {
    sectionIndex: '— Experience',
    title: "Where I've worked",
  },
  personal: {
    headingLines: ['Outside', 'of code.'],
    accentLineIndex: 1,
    body: "Outside of work I run a YouTube channel for quiet travel videos. I'm drawn to mountains and the sea — anywhere a little further from the screen.",
  },
  resume: {
    headingLines: ['Want the', 'full CV?'],
    accentLineIndex: 1,
    sub: 'A one-page PDF with the full picture — roles, dates, tools, and references on request.',
    ctaLabel: 'Download resume',
    ctaHref: cvHref,
  },
} as const satisfies AboutContent;
