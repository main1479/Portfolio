import type { HomeContent } from '../_types/home';

export const homeContent = {
  hero: {
    topbarLeft: { name: 'Mainul Islam', role: 'Frontend Developer' },
    topbarRight: { version: 'Portfolio v3', year: '2026', metric: '7 yrs · 9+ countries' },
    sub: 'I build and run experiments that turn traffic into revenue — 4+ years across Optimizely, Kameleoon, and Qubit, plus modern frontend with Next.js and TypeScript.',
    statusLine: 'Available for new A/B testing & frontend projects',
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
        { kind: 'text', value: ' working remotely since 2019.' },
      ],
      [
        {
          kind: 'text',
          value:
            'My focus is the place where good frontend meets measurable results — building reliable ',
        },
        { kind: 'accent', value: 'A/B tests and conversion experiments' },
        { kind: 'text', value: ' for real businesses.' },
      ],
      [
        { kind: 'text', value: "I've spent the last " },
        { kind: 'strong', value: '4+ years building experiments' },
        {
          kind: 'text',
          value:
            ' on enterprise platforms — Optimizely, Kameleoon, Qubit — alongside modern frontend work in React and Next.js. ',
        },
        { kind: 'strong', value: '500+ A/B tests shipped' },
        { kind: 'text', value: ", and I'm currently taking on new clients." },
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
          "Through agency work, a sampling of brands I've shipped tests for — across publishing, retail, automotive, gaming, and non-profit.",
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
        year: '2022 – 2026',
        roleLines: ['Frontend Developer', '(A/B Testing)'],
        at: '@ Conversion.com',
        desc: 'Long-running contract — A/B tests in JS & SCSS on enterprise experimentation platforms.',
        loc: 'Remote · UK',
      },
      {
        year: '2019 – Present',
        roleLines: ['Freelance Frontend', 'Developer'],
        desc: 'Frontend & experimentation work for startups and individuals across 10+ countries.',
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
    sub: "Now taking on new clients. If you have a frontend build or an experimentation programme in mind, I'd love to hear about it.",
    ctaLabel: 'Start a conversation',
    ctaHref: '/contact',
  },
} as const satisfies HomeContent;
