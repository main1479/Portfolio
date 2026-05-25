import type { AboutContent } from '../_types/about';
import { siteConfig } from './site-config';

const cvHref = siteConfig.cvHref;

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
        lines: ['Open to', 'roles & projects'],
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
        { kind: 'text', value: 'My focus is ' },
        { kind: 'accent', value: 'frontend you can measure' },
        {
          kind: 'text',
          value: ' — building reliable A/B tests and conversion experiments for real businesses.',
        },
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
        { kind: 'strong', value: 'open to new roles' },
        { kind: 'text', value: ' — full-time remote, contract, or freelance.' },
      ],
      [
        { kind: 'text', value: 'I work with ' },
        { kind: 'accent', value: 'AI as a co-engineer' },
        {
          kind: 'text',
          value:
            ', not just an autocomplete. Claude Code and Cursor handle a real share of the keyboard work — scaffolding, refactors, test coverage — while the architecture, the decisions, and the review stay mine. It is how a solo dev can ship a ',
        },
        { kind: 'strong', value: '370k-line platform' },
        { kind: 'text', value: ' without losing the result.' },
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
      {
        name: 'AI as co-engineer',
        tags: [
          'Claude Code',
          'Cursor',
          'AI pair programming',
          'Spec-driven prompting',
          'AI code review',
        ],
      },
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
