import type { AboutContent } from '../_types/about';

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
        { kind: 'text', value: "I've been a " },
        { kind: 'strong', value: 'frontend A/B testing developer with Conversion.com' },
        {
          kind: 'text',
          value: ' for 4.5+ years, building production tests on enterprise platforms. Now ',
        },
        { kind: 'strong', value: 'actively open to new opportunities' },
        { kind: 'text', value: ', full-time remote or contract.' },
      ],
      [
        {
          kind: 'text',
          value:
            'Everyone uses AI now. The skill is using it well enough to actually finish what you start. I treat ',
        },
        { kind: 'accent', value: 'Claude Code' },
        {
          kind: 'text',
          value:
            ' less like a smarter autocomplete and more like a junior engineer who needs the same things every junior needs — a clear spec, the right context, a tight scope, and an honest review pass. That workflow is what makes a ',
        },
        { kind: 'strong', value: '410k-line solo platform' },
        {
          kind: 'text',
          value:
            ' finishable in 1.5 years (including 2 earlier versions I scrapped, and a year+ of planning and architecture banked on what those false starts taught me).',
        },
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
      {
        name: 'Core',
        tags: ['JavaScript (ES6+)', 'TypeScript', 'React', 'Next.js', 'HTML', 'CSS'],
      },
      {
        name: 'AI as co-engineer',
        tags: [
          'Claude Code',
          'Spec-driven prompting',
          'Context management',
          'Agentic workflows',
          'Multi-file refactors',
          'AI code review',
        ],
      },
      { name: 'Styling', tags: ['SCSS', 'Tailwind CSS', 'Bootstrap', 'Modern CSS'] },
      {
        name: 'Experimentation',
        tags: [
          'Optimizely',
          'Kameleoon',
          'Qubit',
          'AB Tasty',
          'VWO',
          'Adobe Target',
          'Google Optimize',
        ],
      },
      {
        name: 'Backend, data & CMS',
        tags: [
          'Node.js',
          'Express.js',
          'GraphQL',
          'PostgreSQL',
          'Drizzle ORM',
          'MongoDB',
          'Firebase',
          'ClickHouse',
          'Cloudflare Workers',
          'WordPress',
          'Headless CMS',
        ],
      },
      {
        name: 'Tooling & PM',
        tags: [
          'Git',
          'Vitest',
          'Playwright',
          'Turborepo',
          'VS Code',
          'Tampermonkey',
          'Slack',
          'JIRA',
          'Asana',
        ],
      },
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
    headingLines: ['Want the', 'long version?'],
    accentLineIndex: 1,
    sub: 'Every role, the stack, and a few projects worth a closer look. Read online, save as a PDF, or just share the link.',
    ctaLabel: 'Open CV',
    ctaHref: '/cv',
  },
} as const satisfies AboutContent;
