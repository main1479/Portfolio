import type { HomeContent } from '../_types/home';

export const homeContent = {
  hero: {
    topbarLeft: { name: 'Mainul Islam', role: 'Frontend Developer' },
    topbarRight: { version: 'Portfolio v3', year: '2026', metric: '7 yrs · 9+ countries' },
    sub: 'I build frontend and run A/B tests that turn traffic into revenue. 4.5+ years on Optimizely, Kameleoon, and Qubit. Modern stack — Next.js, TypeScript, AI-paired workflow.',
    statusLine: 'Open to new roles — full-time or contract',
    ctaLabel: 'Get in touch',
    ctaHref: '/contact',
  },
  marquee: {
    tokens: [
      { label: 'A/B Testing' },
      { label: 'Conversion Optimization', accent: true },
      { label: 'Optimizely' },
      { label: 'Kameleoon' },
      { label: 'Qubit' },
      { label: 'Next.js' },
      { label: 'TypeScript' },
      { label: 'Claude Code', accent: true },
      { label: 'Cursor' },
      { label: 'Experimentation', accent: true },
    ],
  },
  intro: {
    label: '— Introduction',
    indexLabel: '01 / Index',
    paragraphs: [
      [
        { kind: 'text', value: "I'm a " },
        { kind: 'strong', value: 'frontend developer' },
        { kind: 'text', value: ' working remotely since 2019, ' },
        { kind: 'strong', value: 'open to full-time and contract roles' },
        { kind: 'text', value: '.' },
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
        { kind: 'text', value: "I've spent the last " },
        { kind: 'strong', value: '4.5+ years building experiments' },
        {
          kind: 'text',
          value:
            ' on enterprise platforms — Optimizely, Kameleoon, Qubit — alongside modern frontend in React and Next.js. ',
        },
        { kind: 'strong', value: '500+ A/B tests shipped' },
        { kind: 'text', value: '. I work with ' },
        { kind: 'accent', value: 'AI as a co-engineer' },
        {
          kind: 'text',
          value:
            ' — Claude Code, Cursor — to move faster while still owning the design and the result.',
        },
      ],
    ],
  },
  stats: [
    { value: 500, suffix: '+', label: 'A/B tests & experiments shipped' },
    { value: 7, label: 'Years building for the web' },
    { value: 9, suffix: '+', label: 'Countries worked with' },
  ],
  services: {
    sectionIndex: '02 / Disciplines',
    items: [
      {
        num: '01',
        titleLines: ['A/B Testing &', 'Experimentation'],
        desc: 'Building and shipping conversion experiments — from single-element tests to full checkout-flow redesigns.',
        tags: ['Optimizely', 'Kameleoon', 'Qubit', 'CRO'],
      },
      {
        num: '02',
        titleLines: ['Frontend', 'Development'],
        desc: 'Production frontend with Next.js, React, TypeScript, and modern CSS/SCSS. Mobile-first, performance-conscious builds.',
        tags: ['Next.js', 'React', 'TypeScript', 'SCSS'],
      },
      {
        num: '03',
        titleLines: ['Product', 'Building'],
        desc: 'Designing and building complete products solo — architecture, frontend, and the systems around them.',
        tags: ['Architecture', 'PostgreSQL', 'Drizzle'],
      },
    ],
  },
  selectedWork: {
    sectionIndex: '03 / Selected Work',
    indexLink: { href: '/work', label: 'View full work index' },
  },
  selectedClients: {
    sectionIndex: '04 / Clients',
    intro: [
      {
        kind: 'text',
        value:
          "Through agency work, a few brands I've shipped tests for — across publishing, retail, automotive, gaming, and non-profit.",
      },
    ],
    items: [
      { sector: 'News & publishing', nameParts: ['The Times'] },
      { sector: 'Fashion', nameParts: ['G-Star RAW'] },
      { sector: 'Automotive', nameParts: ['Motorway'] },
      { sector: 'Gaming & SaaS', nameParts: ['Unity'] },
      { sector: 'Ecommerce', nameParts: ['Ironmongery', 'Direct'] },
      { sector: 'Non-profit', nameParts: ['WaterAid'] },
      { sector: 'Browser tech', nameParts: ['AdBlock'] },
      { sector: 'HR & SaaS', nameParts: ['Deel'] },
    ],
    foot: '— and many more, listed only where approved.',
  },
  recognition: {
    sectionIndex: '05 / Recognition',
    lede: [
      { kind: 'text', value: 'The previous version of this portfolio was featured as ' },
      { kind: 'strong', value: 'Site of the Day' },
      { kind: 'text', value: ' on design galleries.' },
    ],
    items: [
      {
        sealText: 'SOTD',
        titleLines: ['Site of', 'the Day'],
        source: 'BestCSS.in',
        date: 'Dec 2021',
        href: 'https://www.bestcss.in/user/detail/MainulIslamsPortfolio-26452',
      },
      {
        sealText: 'SOTD',
        titleLines: ['Site of', 'the Day'],
        source: 'Design Nominees',
        date: 'Nov 2021',
        href: 'https://www.designnominees.com/sites/mainul-islams-portfolio',
      },
    ],
  },
  experience: {
    sectionIndex: '06 / Experience',
    items: [
      {
        year: '2022 – Present',
        roleLines: ['Frontend Developer', '(A/B Testing)'],
        at: '@ Conversion.com',
        desc: 'Long-running contract — production A/B tests in JS & SCSS on enterprise experimentation platforms. Ongoing.',
        loc: 'Remote · UK',
      },
      {
        year: '2019 – Present',
        roleLines: ['Freelance Frontend', 'Developer'],
        desc: 'Frontend & experimentation work for startups and individuals across 9+ countries.',
        loc: 'Remote · 9+ countries',
      },
    ],
  },
  endCta: {
    headingLines: [
      { text: "Let's" },
      { text: 'build something', variant: 'outline' },
      { text: 'measurable.' },
    ],
    sub: "Open to new roles — full-time, contract, or freelance. If you're hiring or have a project in mind, send me a note.",
    ctaLabel: 'Start a conversation',
    ctaHref: '/contact',
  },
} as const satisfies HomeContent;
