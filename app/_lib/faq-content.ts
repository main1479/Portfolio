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
      'Daily, and as a co-engineer — not just an autocomplete. Claude Code handles a real share of the keyboard work, Cursor speeds up the inline edits, and the architecture, decisions, and review stay with me. The point is to move faster on real production work, not to ship code I have not read.',
  },
  {
    question: 'What time zone do you work in?',
    answer:
      'I work remotely on a flexible schedule with plenty of overlap with UK and EU mornings, and US evenings.',
  },
] as const satisfies readonly FaqItem[];
