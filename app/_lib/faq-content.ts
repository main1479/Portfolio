import type { FaqItem } from '../_types/contact';

export const faqContent = [
  {
    question: 'What kind of projects are you taking on?',
    answer:
      "Mostly A/B testing work on Optimizely, Kameleoon, or Qubit — and frontend builds in React / Next.js. I'm more useful in scopes where there's a clear measurable outcome.",
  },
  {
    question: 'Do you work with agencies or only end clients?',
    answer:
      "Both. I've worked with optimisation agencies and directly with product teams. Whichever sets up the cleanest workflow.",
  },
  {
    question: 'How do you charge?',
    answer:
      'Fixed-price per test or per scope is usually the cleanest. For ongoing experimentation programmes, a weekly or monthly retainer.',
  },
  {
    question: 'What time zone do you work in?',
    answer:
      'I work remotely on a flexible schedule with plenty of overlap with UK and EU mornings, and US evenings.',
  },
] as const satisfies readonly FaqItem[];
