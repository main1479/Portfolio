import type { CvContent } from '../_types/cv';

export const cvContent = {
  header: {
    name: 'Mainul Islam',
    role: 'Frontend Developer · A/B Testing & Experimentation',
    contact: {
      email: 'm.main2402@gmail.com',
      portfolio: 'mainul.info',
      github: 'github.com/main1479',
      linkedin: 'linkedin.com/in/main1479',
      phone: '+880 1758-032-402',
    },
  },
  about:
    'Frontend developer specialising in A/B testing and experimentation. 4.5+ years on Optimizely, Kameleoon, and Qubit, alongside modern frontend with Next.js and TypeScript. I work with AI as a co-engineer — Claude Code, Cursor — to ship faster while still owning the design and the result. Open to full-time remote and contract roles.',
  stats: [
    { value: '7+ yrs', label: 'Frontend development' },
    { value: '4.5+ yrs', label: 'A/B testing & experimentation' },
    { value: '500+', label: 'A/B tests shipped' },
    { value: '9+', label: 'Countries worked with' },
  ],
  experience: [
    {
      role: 'Frontend Developer (A/B Testing)',
      org: 'Conversion.com',
      dates: '2022 – Present',
      location: 'Remote · UK',
      bullets: [
        'Long-running contract — 4.5+ years and ongoing. Production A/B tests in JavaScript and SCSS on enterprise experimentation platforms (Optimizely, Kameleoon, Qubit, AB Tasty, VWO, Adobe Target, Google Optimize).',
        '500+ experiments shipped across ecommerce, SaaS, publishing, automotive, and non-profit clients — including The Times, G-Star RAW, Motorway, Unity, WaterAid, and Deel.',
        'Built Radius — Conversion.com’s internal insights & experiments platform. Frontend in Next.js + TypeScript + SCSS with GSAP motion and streaming APIs. Live, in daily use by internal teams and client stakeholders.',
      ],
    },
    {
      role: 'Freelance Frontend Developer',
      dates: '2019 – Present',
      location: 'Remote · 9+ countries',
      bullets: [
        '120+ frontend builds across LMS, e-learning, ecommerce, rentals, and SaaS — for startups and individuals in the UK, India, Slovakia, Austria, Australia, Canada, Romania, Italy, and Mexico.',
        'Translating Figma / XD designs into production HTML, SCSS, and modern JavaScript / TypeScript / React / Next.js — mobile-first, performance-conscious, accessible.',
      ],
    },
  ],
  featuredProjects: [
    {
      title: 'AvsB',
      tagline: 'Full-stack A/B testing & feature-flag platform',
      dates: '2024 – Present',
      meta: 'Solo · 1.5+ years · Pre-launch',
      bullets: [
        '370k lines of TypeScript / SCSS · 250 API routes · 71 Prisma models · 867 test files.',
        'Three statistical engines side-by-side (frequentist, Bayesian, sequential) with variance reduction.',
        'Five Cloudflare Workers for edge ingestion, ClickHouse store, four published SDK packages.',
        'AI-paired build with Claude Code throughout — architecture, decisions, and review stay mine.',
      ],
      href: 'mainul.info/work/avsb',
    },
    {
      title: 'Kemon Doctor',
      tagline: 'Non-profit doctor review platform for Bangladesh',
      dates: '2025 – Present',
      meta: 'Solo founder & developer · In progress',
      bullets: [
        'Bilingual (Bangla + English) trust layer helping patients find reliable doctors and surface over-prescribing.',
        'Mobile-first Next.js 15 build for real conditions in Bangladesh — older phones, patchy 3G, mixed-language users.',
        'Server-rendered for fast first paint over slow networks; Drizzle ORM for type-safe migrations on Postgres.',
      ],
      href: 'mainul.info/work/kemon-doctor',
    },
  ],
  clientWork: [
    {
      name: 'Cursimax',
      year: '2021',
      role: 'Full frontend for a Spanish-language e-learning marketplace',
    },
    {
      name: 'Flatwhite',
      year: '2020',
      role: 'Frontend for a Romanian rentals & property-management company',
    },
    { name: 'Lenoir App', year: '2021', role: 'Browser-based iPad OS apps' },
    { name: 'ScalingLab', year: '2021', role: 'Founder website for Theodore Mollinger' },
    { name: 'Azzeroco', year: '2020', role: 'Frontend for an Italian sustainability brand' },
  ],
  skills: [
    {
      name: 'Core',
      tags: ['JavaScript (ES6+)', 'TypeScript', 'React', 'Next.js', 'HTML', 'CSS'],
    },
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
  awards: [
    {
      title: 'Site of the Day',
      source: 'BestCSS.in',
      date: 'Dec 2021',
      href: 'https://www.bestcss.in/user/detail/MainulIslamsPortfolio-26452',
    },
    {
      title: 'Site of the Day',
      source: 'Design Nominees',
      date: 'Nov 2021',
      href: 'https://www.designnominees.com/sites/mainul-islams-portfolio',
    },
  ],
} as const satisfies CvContent;
