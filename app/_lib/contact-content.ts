import type { ContactContent } from '../_types/contact';
import { siteConfig } from './site-config';

const cvHref = siteConfig.cvHref;

export const contactContent = {
  pageIntro: {
    label: '04 / Contact',
    titleLines: ["Let's work", 'together.'],
    accentLineIndex: 1,
    sub: 'Open to new frontend roles — full-time remote, contract, or freelance. Send a note or email directly — I usually reply within a day or two.',
  },
  aside: {
    heading: 'Direct lines.',
    body: "If a form isn't your thing — here's how to reach me directly. Best for quick questions, intros, or referrals.",
    direct: [
      {
        label: 'Email',
        value: 'm.main2402@gmail.com',
        href: 'mailto:m.main2402@gmail.com',
        external: false,
      },
      {
        label: 'GitHub',
        value: '@main1479',
        href: 'https://github.com/main1479',
        external: true,
      },
      {
        label: 'Resume',
        value: 'Download CV',
        href: cvHref,
        external: true,
      },
    ],
  },
  form: {
    title: 'New message',
    fields: {
      name: { num: '01', label: 'Your name', placeholder: 'Jane Doe' },
      email: { num: '02', label: 'Email', placeholder: 'jane@company.com' },
      topic: {
        num: '03',
        label: "What's this about?",
        options: [
          { value: 'full-time-role', label: 'Full-time role' },
          { value: 'contract-freelance', label: 'Contract / freelance' },
          { value: 'a-b-testing', label: 'A/B testing project' },
          { value: 'frontend-build', label: 'Frontend build' },
          { value: 'something-else', label: 'Something else' },
        ],
      },
      message: {
        num: '04',
        label: 'Tell me more',
        placeholder: 'A short note on the project, timeline, and what success looks like.',
      },
    },
    submit: {
      label: 'Send message',
      note: '↳ I usually reply within 24 hours on weekdays, and within a day or two on weekends.',
    },
    reset: {
      label: 'Clear',
    },
    success: {
      titleLines: ['Message', 'sent.'],
      accentLineIndex: 1,
      body: "Thanks for reaching out. I'll get back to you within a day or two. In the meantime, feel free to grab the resume or browse the work.",
      ctaLabel: 'See the work',
      ctaHref: '/work',
    },
  },
  faq: {
    sectionIndex: '— FAQ',
    title: 'Common questions',
  },
} as const satisfies ContactContent;
