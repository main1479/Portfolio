import type { FaqItem } from '../_types/contact';

export const faqContent = [
  {
    question: 'What are you looking for?',
    answer:
      "A full-time remote frontend role — ideally one where experimentation or growth is part of the work. I'm open to contract and freelance projects too.",
  },
  {
    question: 'What kinds of teams do you work best with?',
    answer:
      "Product teams, experimentation teams, and growth teams. I've shipped through optimisation agencies and directly with product teams — whichever sets up the cleanest workflow.",
  },
  {
    question: 'How do you use AI in your day-to-day work?',
    answer:
      'Daily, and as a real engineering skill. Claude Code is my daily driver — I treat it less like a smarter autocomplete and more like a junior engineer who needs the things every junior needs: a clear spec, the right context, a tight scope, and an honest review pass. The skill is in the workflow, not the typing — knowing what to delegate, what to keep on the keyboard, and how to keep the feedback loop tight enough to ship production-quality work. Everyone uses AI now; finishing what you start with it is the part most people miss. AvsB — 370k lines, solo, in production — is the proof at scale.',
  },
  {
    question: 'What time zone do you work in?',
    answer:
      'I work remotely on a flexible schedule with plenty of overlap with UK and EU mornings, and US evenings.',
  },
] as const satisfies readonly FaqItem[];
