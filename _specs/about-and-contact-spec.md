# Spec — About + Contact (Phase 5)

**Status:** Draft — awaiting approval
**Date:** 2026-05-22
**Branch:** `feature/about-and-contact`
**Plan:** `_plans/about-and-contact-plan.md`
**Masterplan reference:** `docs/MASTERPLAN.md` §10 Phase 5 (lines 728–769), §5.5 (About), §5.6 (Contact), §6.6 (About content), §6.7 (Contact content), §11 (deps), §12 (env vars), §13 (open questions)
**Source of truth (markup):** `Mainul's Portfolio/about.html` (456 lines) and `Mainul's Portfolio/contact.html` (532 lines)
**Source of truth (styles):** the `<style>` block at the top of each legacy file + `Mainul's Portfolio/assets/shared.css`
**Source of truth (behaviours):** the inline `<script>` at the bottom of `contact.html` (lines 502–529); About has no JS

---

## 0. Recap

Port the legacy About and Contact pages into the live Next.js app. `/about` becomes the full About page: PageIntro, AboutBio (sticky portrait + bio), Skills (5 groups), Experience (re-used from home), Personal, ResumeCTA. `/contact` becomes the full Contact page: PageIntro, ContactAside with three direct lines, a Zod-validated ContactForm with topic chips and a Resend-backed POST handler, and a four-item FAQ accordion. Composition uses Phase 3 primitives wherever they fit; new page-level CSS lives in component modules.

This phase also promotes `Experience` from `app/_components/home/` to the shared `app/_components/` namespace so About can import it without reaching into the home folder.

## 1. File tree

```
app/
├── about/                                                          ← NEW route
│   ├── page.tsx                                                    ← server — composes the page
│   ├── _aboutPage.module.scss                                      ← page-level layout (no global rules)
│   └── _components/
│       ├── AboutBio/
│       │   ├── AboutBio.tsx                                        ← server — two-column grid
│       │   ├── AboutAvatar.tsx                                     ← server (flat) — striped + next/image
│       │   ├── AboutCard.tsx                                       ← server (flat) — info card
│       │   └── _AboutBio.module.scss
│       ├── Skills/
│       │   ├── Skills.tsx                                          ← server — five skill groups
│       │   ├── SkillGroup.tsx                                      ← server (flat) — single group
│       │   └── _Skills.module.scss
│       ├── Personal/
│       │   ├── Personal.tsx                                        ← server — "Outside of code." block
│       │   └── _Personal.module.scss
│       └── ResumeCTA/
│           ├── ResumeCTA.tsx                                       ← server — black card + download CTA
│           └── _ResumeCTA.module.scss
├── contact/                                                        ← NEW route
│   ├── page.tsx                                                    ← server — composes the page
│   ├── _contactPage.module.scss                                    ← page-level layout
│   └── _components/
│       ├── ContactAside/
│       │   ├── ContactAside.tsx                                    ← server — heading + body + direct list
│       │   ├── DirectLink.tsx                                      ← server (flat) — single row
│       │   └── _ContactAside.module.scss
│       ├── ContactForm/
│       │   ├── ContactForm.tsx                                     ← 'use client' — state machine + submit
│       │   ├── TopicChips.tsx                                      ← 'use client' (flat) — radiogroup
│       │   ├── FormSuccess.tsx                                     ← server (flat) — success-state markup
│       │   └── _ContactForm.module.scss
│       └── FAQ/
│           ├── FAQ.tsx                                             ← server — native <details> accordions
│           └── _FAQ.module.scss
├── api/
│   └── contact/
│       └── route.ts                                                ← NEW — POST handler
├── _components/
│   └── Experience/                                                 ← PROMOTED from app/_components/home/Experience/
│       ├── Experience.tsx
│       ├── XpRow.tsx
│       └── _Experience.module.scss
├── _lib/
│   ├── about-content.ts                                            ← NEW
│   ├── contact-content.ts                                          ← NEW
│   ├── faq-content.ts                                              ← NEW
│   ├── contact-schema.ts                                           ← NEW — Zod schema + type
│   └── email.ts                                                    ← NEW — Resend wrapper
└── _types/
    ├── about.ts                                                    ← NEW
    └── contact.ts                                                  ← NEW

public/
└── me.jpg                                                          ← NEW — self-hosted portrait (or me.webp)

(repo root)
└── .env.local.example                                              ← NEW — documents the four env vars
```

**File moves (the `Experience` promotion):**

```
app/_components/home/Experience/Experience.tsx        →  app/_components/Experience/Experience.tsx
app/_components/home/Experience/XpRow.tsx             →  app/_components/Experience/XpRow.tsx
app/_components/home/Experience/_Experience.module.scss → app/_components/Experience/_Experience.module.scss
```

And in `app/page.tsx`, one import path changes:

```diff
- import { Experience } from './_components/home/Experience/Experience';
+ import { Experience } from './_components/Experience/Experience';
```

Nothing inside the three moved files changes. The relative import inside `XpRow.tsx` (`'../../../_types/home'`) still resolves correctly because it climbs to `app/_types/home.ts` from either old or new location.

**Counts:** 25 new files, 1 page-level Edit in `app/page.tsx`, 3 file moves, 1 new env example, 1 new `public/` asset. No edits to chrome, tokens, layout.tsx, or any Phase 4 component logic.

**No `index.ts` re-exports anywhere.** Every consumer imports the named file directly.

## 2. Type contracts

### 2.1 `app/_types/about.ts`

```ts
export type AboutCardData = {
  /** Mono label above the value (e.g. 'Currently', 'Focus'). */
  label: string;
  /** Display lines; rendered with <br/> between, with an optional accent line index. */
  lines: readonly string[];
  /** Index inside `lines` whose contents get the accent colour. Omit for no accent. */
  accentLineIndex?: number;
};

export type BioParagraphSegment =
  | { kind: 'text'; value: string }
  | { kind: 'strong'; value: string }
  | { kind: 'accent'; value: string }
  | { kind: 'em'; value: string };

export type BioParagraph = ReadonlyArray<BioParagraphSegment>;

export type SkillGroupData = {
  /** Display name of the group (e.g. 'Core'). */
  name: string;
  /** Tags rendered as oversize display words separated by hairlines. */
  tags: readonly string[];
};

export type ResumeCtaData = {
  /** Heading lines; index `accentLineIndex` gets the accent colour. */
  headingLines: readonly string[];
  accentLineIndex: number;
  /** Sub-body, ≤44ch. */
  sub: string;
  /** Button label. */
  ctaLabel: string;
  /** Button href. TODO Phase 7: swap to '/cv.pdf'. */
  ctaHref: string;
};

export type PersonalData = {
  /** Heading lines; index `accentLineIndex` gets the accent colour. */
  headingLines: readonly string[];
  accentLineIndex: number;
  /** Body paragraph. */
  body: string;
};

export type AboutContent = {
  pageIntro: {
    label: string;
    /** Title lines. Index 1 (the second line) is accent in the legacy. */
    titleLines: readonly string[];
    accentLineIndex: number;
  };
  bio: {
    /** Portrait alt text. Decorative wrapper is aria-hidden — but the <img> itself still needs alt. */
    portraitAlt: string;
    /** Tag pill text inside the avatar (e.g. 'Mainul Islam, 2026'). */
    portraitTag: string;
    /** Sticky side cards (Currently / Focus). */
    cards: readonly AboutCardData[];
    /** Bio paragraphs as rich-text segment arrays. */
    paragraphs: readonly BioParagraph[];
  };
  skills: {
    sectionIndex: string;
    /** Title nodes use an inline accent dot at the end. */
    title: string;
    groups: readonly SkillGroupData[];
  };
  experience: {
    sectionIndex: string;
    title: string;
    /** No `items` field here — the Experience section imports homeContent.experience.items
     *  (the same two xp rows on home + about) from app/_lib/home-content.ts. */
  };
  personal: PersonalData;
  resume: ResumeCtaData;
};
```

### 2.2 `app/_types/contact.ts`

```ts
import type { z } from 'zod';
import type { contactSchema } from '../_lib/contact-schema';

/** Submit payload — derived from Zod, not hand-kept. */
export type ContactFormInput = z.infer<typeof contactSchema>;

export type ContactFormErrors = Partial<Record<keyof ContactFormInput, string>>;

export type ContactFormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'error'; errors: ContactFormErrors; message?: string }
  | { status: 'success'; id: string };

export type TopicValue = 'a-b-testing' | 'frontend-build' | 'product-work' | 'something-else';

export type TopicOption = {
  /** Submitted value (kebab-case for URLs/logs). */
  value: TopicValue;
  /** Visible chip label. */
  label: string;
};

export type DirectLinkData = {
  /** Two-digit ordinal omitted — mono label is the textual one ('Email', 'GitHub', 'Resume'). */
  label: string;
  /** Display value (e.g. 'm.main2402@gmail.com', '@main1479'). */
  value: string;
  /** Target URL. */
  href: string;
  /** Open in a new tab + noopener/noreferrer. */
  external: boolean;
};

export type FaqItem = {
  question: string;
  /** Single paragraph. */
  answer: string;
};

export type ContactContent = {
  pageIntro: {
    label: string;
    titleLines: readonly string[];
    accentLineIndex: number;
    sub: string;
  };
  aside: {
    heading: string;
    body: string;
    /** Three direct lines (email, GitHub, resume). */
    direct: readonly DirectLinkData[];
  };
  form: {
    /** Tiny mono header label inside the form panel ('New message'). */
    title: string;
    fields: {
      name: { num: string; label: string; placeholder: string };
      email: { num: string; label: string; placeholder: string };
      topic: { num: string; label: string; options: readonly TopicOption[] };
      message: { num: string; label: string; placeholder: string };
    };
    submit: {
      label: string;
      note: string;
    };
    reset: {
      label: string;
    };
    success: {
      titleLines: readonly string[];
      /** Index inside titleLines that gets the accent colour. */
      accentLineIndex: number;
      body: string;
      ctaLabel: string;
      ctaHref: string;
    };
  };
  faq: {
    sectionIndex: string;
    title: string;
    /** Pulled from faq-content.ts — same shape, kept separate so editing copy doesn't touch contact-content.ts. */
  };
};
```

### 2.3 Notes on types

- `BioParagraphSegment` is the same discriminated-union shape used by Phase 4's `IntroSegment`. Could be shared via a tiny `app/_types/rich-text.ts`, but only two consumers exist (intro + bio); under the three-usage threshold from CLAUDE.md, the duplication stays.
- `ContactFormInput` is **derived** from the Zod schema (`z.infer<typeof contactSchema>`), not declared independently. Single source of truth.
- `TopicValue` is a kebab-case enum so the server can log it cleanly and so URL-encoding never bites. The visible label ("A/B testing") lives separately on `TopicOption.label`.
- `DirectLinkData.external` mirrors `MetaLink.external` in `siteConfig` — keep both naming conventions identical so future "promote one into the other" refactors are mechanical.

## 3. Content files

### 3.1 `app/_lib/about-content.ts`

Strongly typed `aboutContent: AboutContent` object exported `as const satisfies AboutContent`. Drawn line-for-line from `about.html`:

- **pageIntro.label** = `'03 / About'`
- **pageIntro.titleLines** = `['A frontend dev,', 'measuring his work.']`
- **pageIntro.accentLineIndex** = `1`
- **bio.portraitAlt** = `'Mainul Islam, photographed in 2026.'` (the legacy uses `alt=""` because the surrounding wrapper is `aria-hidden`; Phase 5 corrects this — the portrait is meaningful content)
- **bio.portraitTag** = `'Mainul Islam, 2026'`
- **bio.cards** = two cards: `{ label: 'Currently', lines: ['Available for', 'new projects'], accentLineIndex: 1 }` and `{ label: 'Focus', lines: ['A/B Testing', '& Frontend'] }`
- **bio.paragraphs** = five rich-text paragraphs from `about.html:314–319`. The first paragraph wraps `frontend developer` in `strong`. Second wraps `A/B tests and conversion experiments` in `accent`. Third uses `em` around `prove`, `strong` around `500+ A/B tests shipped`. Fourth uses `strong` around `Conversion.com` and `actively taking on new clients`. Fifth is plain text.
- **skills.sectionIndex** = `'— Stack & Skills'`, **skills.title** = `'What I build with'`
- **skills.groups** = five groups, each `{ name, tags }`:
  1. `Core` — `JavaScript`, `TypeScript`, `React`, `Next.js`
  2. `Styling` — `SCSS`, `Tailwind`, `Modern CSS`
  3. `Experimentation` — `Optimizely`, `Kameleoon`, `Qubit`, `CRO`
  4. `Tooling & Testing` — `Vitest`, `Playwright`, `Git`, `Turborepo`
  5. `Also working with` — `PostgreSQL`, `Drizzle ORM`, `Node.js`, `ClickHouse`
- **experience.sectionIndex** = `'— Experience'`, **experience.title** = `"Where I've worked"`. Items come from `homeContent.experience.items` (the same two xp rows on home).
- **personal.headingLines** = `['Outside', 'of code.']`, **personal.accentLineIndex** = `1`, **personal.body** = the single paragraph from `about.html:405`
- **resume.headingLines** = `['Want the', 'full CV?']`, **resume.accentLineIndex** = `1`
- **resume.sub** = `'A one-page PDF with the full picture — roles, dates, tools, and references on request.'`
- **resume.ctaLabel** = `'Download resume'`
- **resume.ctaHref** = the Google Drive URL from `siteConfig.metaLinks` (the `Resume / CV ↗` link) — read from `siteConfig` rather than duplicated. `// TODO Phase 7: swap to '/cv.pdf'` comment at the call site.

### 3.2 `app/_lib/contact-content.ts`

Strongly typed `contactContent: ContactContent` object. Drawn from `contact.html`:

- **pageIntro.label** = `'04 / Contact'`
- **pageIntro.titleLines** = `["Let's work", 'together.']`, **accentLineIndex** = `1`
- **pageIntro.sub** = `'Available for new A/B testing and frontend projects. Send me a message or email me directly — I usually reply within a day or two.'`
- **aside.heading** = `'Direct lines.'` (the trailing `.` rendered in accent — see `ContactAside.tsx`)
- **aside.body** = `"If a form isn't your thing — here's how to reach me directly. Best for quick questions or referrals."`
- **aside.direct** = three `DirectLinkData`:
  - `{ label: 'Email', value: 'm.main2402@gmail.com', href: 'mailto:m.main2402@gmail.com', external: false }`
  - `{ label: 'GitHub', value: '@main1479', href: 'https://github.com/main1479', external: true }`
  - `{ label: 'Resume', value: 'Download CV', href: <siteConfig CV url>, external: true }` — `// TODO Phase 7: swap to '/cv.pdf'`
- **form.title** = `'New message'`
- **form.fields.name** = `{ num: '01', label: 'Your name', placeholder: 'Jane Doe' }`
- **form.fields.email** = `{ num: '02', label: 'Email', placeholder: 'jane@company.com' }`
- **form.fields.topic** = `{ num: '03', label: "What's this about?", options: <four TopicOption> }`
  - Options: `[{ value: 'a-b-testing', label: 'A/B testing' }, { value: 'frontend-build', label: 'Frontend build' }, { value: 'product-work', label: 'Product work' }, { value: 'something-else', label: 'Something else' }]`
- **form.fields.message** = `{ num: '04', label: 'Tell me more', placeholder: 'A short note on the project, timeline, and what success looks like.' }`
- **form.submit** = `{ label: 'Send message', note: '↳ I usually reply in 1–2 days' }`
- **form.reset** = `{ label: 'Clear' }`
- **form.success.titleLines** = `['Message', 'sent.']`, **accentLineIndex** = `1`
- **form.success.body** = `"Thanks for reaching out. I'll get back to you within a day or two. In the meantime, feel free to grab the resume or browse the work index."`
- **form.success.ctaLabel** = `'See the work'`, **form.success.ctaHref** = `'/work'`
- **faq.sectionIndex** = `'— FAQ'`, **faq.title** = `'Common questions'`

### 3.3 `app/_lib/faq-content.ts`

```ts
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
```

Kept separate from `contact-content.ts` so future copy edits to the FAQ don't churn the larger file.

## 4. Zod schema + form-state union — `app/_lib/contact-schema.ts`

```ts
import { z } from 'zod';

export const TOPIC_VALUES = [
  'a-b-testing',
  'frontend-build',
  'product-work',
  'something-else',
] as const;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter your name (at least 2 characters).')
    .max(80, 'Name is too long.'),
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address.')
    .email('Enter a valid email address.')
    .max(160, 'Email is too long.'),
  topic: z.enum(TOPIC_VALUES, {
    errorMap: () => ({ message: 'Pick a topic — what is this about?' }),
  }),
  message: z
    .string()
    .trim()
    .min(20, 'Add a short note (at least 20 characters).')
    .max(4000, 'Message is too long — keep it under 4000 characters.'),
  /** Honeypot. Real users never see or fill this. Bots that fill every input get caught. */
  company: z.string().max(0, 'Spam check failed.').optional().default(''),
});

export type ContactInput = z.infer<typeof contactSchema>;
```

Notes:

- `.trim()` on the string fields so whitespace-only submissions are rejected.
- The `company` field has `max(0)` so any non-empty value fails validation. The handler treats validation failure for the honeypot differently from validation failure for real fields — see §5.
- Error messages are user-readable strings, not codes. They're rendered directly by the form below the field via `aria-describedby`.

## 5. API route handler — `app/api/contact/route.ts`

```ts
import { NextResponse } from 'next/server';
import { contactSchema } from '../../_lib/contact-schema';
import { sendContactEmail } from '../../_lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Configuration guard
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_FROM || !process.env.CONTACT_TO) {
    return NextResponse.json({ success: false, error: 'CONTACT_NOT_CONFIGURED' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    // Honeypot: if `company` was the only failure, silently succeed with a fake id.
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const onlyHoneypotFailed = Object.keys(fieldErrors).length === 1 && 'company' in fieldErrors;
    if (onlyHoneypotFailed) {
      return NextResponse.json({ success: true, data: { id: 'noop' } }, { status: 200 });
    }
    return NextResponse.json({ success: false, error: 'VALIDATION', fieldErrors }, { status: 422 });
  }

  const { name, email, topic, message } = parsed.data;

  try {
    const id = await sendContactEmail({ name, email, topic, message });
    return NextResponse.json({ success: true, data: { id } }, { status: 200 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error sending email.';
    return NextResponse.json(
      { success: false, error: 'SEND_FAILED', detail: errorMessage },
      { status: 502 },
    );
  }
}
```

Notes:

- `runtime = 'nodejs'` because Resend's SDK uses Node APIs (Buffer, etc.).
- `dynamic = 'force-dynamic'` so Next doesn't try to statically optimise the POST route.
- Response shape consistently matches CLAUDE.md's API envelope: `{ success: true, data }` or `{ success: false, error, … }`.
- Validation errors use HTTP 422 (Unprocessable Entity) — a sharp signal to the client to render field-level errors. Configuration errors use 503, send failures use 502.
- The honeypot returns a fake `id: 'noop'` and HTTP 200 deliberately. Bots get told "yes, sent" and move on. Real users never hit this branch because the field is empty.
- No rate-limiting (deferred — see plan).
- No CORS — the form lives on the same origin; no `OPTIONS` handler needed.

## 6. Email wrapper — `app/_lib/email.ts`

```ts
import { Resend } from 'resend';
import type { ContactInput } from './contact-schema';

const TOPIC_LABELS: Record<ContactInput['topic'], string> = {
  'a-b-testing': 'A/B testing',
  'frontend-build': 'Frontend build',
  'product-work': 'Product work',
  'something-else': 'Something else',
};

export async function sendContactEmail(
  input: Pick<ContactInput, 'name' | 'email' | 'topic' | 'message'>,
): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  const to = process.env.CONTACT_TO;

  if (!apiKey || !from || !to) {
    throw new Error('Email transport not configured.');
  }

  const resend = new Resend(apiKey);
  const topicLabel = TOPIC_LABELS[input.topic];

  const subject = `Portfolio · ${topicLabel} · from ${input.name}`;
  const text = [
    `From: ${input.name} <${input.email}>`,
    `Topic: ${topicLabel}`,
    '',
    input.message,
  ].join('\n');

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
    replyTo: input.email,
  });

  if (error) {
    throw new Error(error.message ?? 'Resend send failed.');
  }
  if (!data?.id) {
    throw new Error('Resend response missing id.');
  }
  return data.id;
}
```

Notes:

- Single function, single purpose. The route handler is the only consumer.
- `replyTo` is the user's email — Mainul can hit "Reply" in his inbox and the response goes to the user (not to `CONTACT_FROM`).
- Plain text only. No HTML template (decision §"What does the Resend handler send" in the plan).
- Subject line includes topic + name so the inbox is scannable.

## 7. Env vars + `.env.local.example`

`.env.local.example` (committed at repo root):

```env
# Required for the contact form (app/api/contact/route.ts).
# Get an API key from https://resend.com/api-keys (free tier covers 3,000 emails/month).
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx

# The "from" address. Must be a verified sender on the Resend dashboard.
CONTACT_FROM=Portfolio <hello@yourdomain.com>

# Where contact-form submissions land.
CONTACT_TO=m.main2402@gmail.com

# Public site URL — used by metadataBase, sitemap, OG image (Phase 7).
NEXT_PUBLIC_SITE_URL=https://mainulislam.dev
```

The real `.env.local` is gitignored. `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO` are required for the form to work in dev. `NEXT_PUBLIC_SITE_URL` is unused in Phase 5; declared here so the example file is whole.

## 8. Page composition

### 8.1 `app/about/page.tsx`

```tsx
import { Container } from '../_components/Container/Container';
import { Section } from '../_components/Section/Section';
import { PageIntro } from '../_components/PageIntro/PageIntro';
import { SectionHead } from '../_components/SectionHead/SectionHead';
import { Reveal } from '../_components/Reveal/Reveal';
import { Experience } from '../_components/Experience/Experience';
import { Footer } from '../_components/Footer/Footer';
import { AboutBio } from './_components/AboutBio/AboutBio';
import { Skills } from './_components/Skills/Skills';
import { Personal } from './_components/Personal/Personal';
import { ResumeCTA } from './_components/ResumeCTA/ResumeCTA';
import { aboutContent } from '../_lib/about-content';
import { homeContent } from '../_lib/home-content';
import styles from './_aboutPage.module.scss';

export const metadata = {
  title: 'About · Mainul Islam',
  description:
    'Frontend developer working remotely since 2019. Specialised in A/B testing and experimentation.',
};

export default function AboutPage() {
  return (
    <>
      <PageIntro
        label={aboutContent.pageIntro.label}
        titleNodes={
          <>
            {aboutContent.pageIntro.titleLines.map((line, i) => (
              <span
                key={i}
                className={i === aboutContent.pageIntro.accentLineIndex ? 'accent' : undefined}
              >
                {line}
                {i < aboutContent.pageIntro.titleLines.length - 1 && <br />}
              </span>
            ))}
          </>
        }
      />
      <Section className={styles.bioSection}>
        <Container>
          <AboutBio content={aboutContent.bio} />
        </Container>
      </Section>
      <Section>
        <Container>
          <Reveal>
            <SectionHead
              index={aboutContent.skills.sectionIndex}
              titleNodes={
                <>
                  {aboutContent.skills.title}
                  <span className="accent">.</span>
                </>
              }
            />
          </Reveal>
          <Skills groups={aboutContent.skills.groups} />
        </Container>
      </Section>
      <Section>
        <Container>
          <Reveal>
            <SectionHead
              index={aboutContent.experience.sectionIndex}
              titleNodes={
                <>
                  {aboutContent.experience.title}
                  <span className="accent">.</span>
                </>
              }
            />
          </Reveal>
          <Experience items={homeContent.experience.items} />
        </Container>
      </Section>
      <section>
        <Container>
          <Personal content={aboutContent.personal} />
        </Container>
      </section>
      <Section className={styles.resumeSection}>
        <Container>
          <ResumeCTA content={aboutContent.resume} />
        </Container>
      </Section>
      <Footer
        heading={
          <>
            Let&rsquo;s talk —<br />
            <a href={`mailto:${'m.main2402@gmail.com'}`}>
              m.main2402
              <wbr />
              @gmail.com
            </a>
          </>
        }
      />
    </>
  );
}
```

Wait — `<Footer>` is mounted in `app/layout.tsx`, not in pages. Re-reading `app/layout.tsx`: yes, `<Footer />` is in the layout. So a per-page `heading` override has to flow via another mechanism. Options:

- **A.** Move `<Footer />` out of `layout.tsx` and into each page that needs it (home + about + contact + work + cases), with per-page `heading` props. Costs: a small amount of duplication; benefit: trivial per-page customisation.
- **B.** Keep `<Footer />` in the layout, do not customise the heading per page. Costs: lose the per-page variation that exists in the legacy.
- **C.** Read `usePathname()` inside `<Footer>` and switch the heading based on route. Costs: forces `<Footer>` to become a client component.

**Decision:** option A. The footer was always intended to vary per page (`Footer` already accepts `heading` and `metaLinks` props in Phase 3); the layout's mount was a Phase 3 convenience. Move it. This is one extra edit in this phase but it's the right shape long-term. Update `app/layout.tsx`: remove `<Footer />` and the import. Then each `page.tsx` renders its own `<Footer>`.

**Updated `app/layout.tsx` diff:**

```diff
- import { Footer } from './_components/Footer/Footer';
- …
        <main id="main-content">{children}</main>
-       <Footer />
      </body>
```

And `app/page.tsx` (the home page) gains a `<Footer />` at the bottom — defaulting heading (`Say hello —`). All Phase 4 behaviour preserved.

### 8.2 `app/contact/page.tsx`

```tsx
import { Container } from '../_components/Container/Container';
import { Section } from '../_components/Section/Section';
import { PageIntro } from '../_components/PageIntro/PageIntro';
import { SectionHead } from '../_components/SectionHead/SectionHead';
import { Reveal } from '../_components/Reveal/Reveal';
import { Footer } from '../_components/Footer/Footer';
import { ContactAside } from './_components/ContactAside/ContactAside';
import { ContactForm } from './_components/ContactForm/ContactForm';
import { FAQ } from './_components/FAQ/FAQ';
import { contactContent } from '../_lib/contact-content';
import { faqContent } from '../_lib/faq-content';
import styles from './_contactPage.module.scss';

export const metadata = {
  title: 'Contact · Mainul Islam',
  description:
    'Available for new A/B testing and frontend projects. Send a message or email directly.',
};

export default function ContactPage() {
  return (
    <>
      <PageIntro
        label={contactContent.pageIntro.label}
        titleNodes={
          <>
            {contactContent.pageIntro.titleLines.map((line, i) => (
              <span
                key={i}
                className={i === contactContent.pageIntro.accentLineIndex ? 'accent' : undefined}
              >
                {line}
                {i < contactContent.pageIntro.titleLines.length - 1 && <br />}
              </span>
            ))}
          </>
        }
        sub={contactContent.pageIntro.sub}
      />
      <Section className={styles.formSection}>
        <Container>
          <div className={styles.grid}>
            <Reveal>
              <ContactAside content={contactContent.aside} />
            </Reveal>
            <Reveal delay={1}>
              <ContactForm content={contactContent.form} />
            </Reveal>
          </div>
        </Container>
      </Section>
      <Section>
        <Container narrow>
          <Reveal>
            <SectionHead
              index={contactContent.faq.sectionIndex}
              titleNodes={
                <>
                  {contactContent.faq.title}
                  <span className="accent">.</span>
                </>
              }
            />
          </Reveal>
          <Reveal>
            <FAQ items={faqContent} />
          </Reveal>
        </Container>
      </Section>
      <Footer
        heading={
          <>
            Or just say hi —<br />
            <a href="mailto:m.main2402@gmail.com">
              m.main2402
              <wbr />
              @gmail.com
            </a>
          </>
        }
      />
    </>
  );
}
```

Note: `<Container>` accepts a `narrow` prop (per Phase 3 spec) for the 1100px variant used on the FAQ. Verify the prop signature when implementation starts; if `<Container>` doesn't expose it yet, add it as a one-line `narrow?: boolean` prop in this phase.

### 8.3 Page-level styles

**`app/about/_aboutPage.module.scss`:**

```scss
.bioSection {
  padding-top: 40px; // matches legacy about.html:295 inline style
}

.resumeSection {
  padding-top: 0; // matches legacy about.html:414 inline style
}
```

**`app/contact/_contactPage.module.scss`:**

```scss
.formSection {
  padding-top: 0; // matches legacy contact.html:357 inline style
}

.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: clamp(40px, 6vw, 120px);
  align-items: start;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

Nothing else lives at the page level. All visual chrome belongs to component modules.

## 9. Component specs

### 9.1 `AboutBio/AboutBio.tsx` — server

```tsx
import { AboutAvatar } from './AboutAvatar';
import { AboutCard } from './AboutCard';
import { Reveal } from '../../../_components/Reveal/Reveal';
import type { AboutContent } from '../../../_types/about';
import styles from './_AboutBio.module.scss';

type Props = { content: AboutContent['bio'] };

export function AboutBio({ content }: Props) {
  return (
    <div className={styles.bio}>
      <Reveal className={styles.side}>
        <AboutAvatar tag={content.portraitTag} alt={content.portraitAlt} />
        {content.cards.map((card, i) => (
          <AboutCard key={i} card={card} />
        ))}
      </Reveal>
      <Reveal delay={1} className={styles.body}>
        {content.paragraphs.map((para, i) => (
          <p key={i}>{renderBioSegments(para)}</p>
        ))}
      </Reveal>
    </div>
  );
}

function renderBioSegments(para: BioParagraph) {
  return para.map((seg, i) => {
    switch (seg.kind) {
      case 'strong':
        return <strong key={i}>{seg.value}</strong>;
      case 'accent':
        return (
          <span key={i} className="accent">
            {seg.value}
          </span>
        );
      case 'em':
        return <em key={i}>{seg.value}</em>;
      default:
        return <span key={i}>{seg.value}</span>;
    }
  });
}
```

CSS: two-column grid `minmax(0, 1fr) minmax(0, 1.4fr)`, gap `clamp(40px, 6vw, 120px)`, items start-aligned. `.side` is `position: sticky; top: 110px;` with `display: flex; flex-direction: column; gap: 32px;`. At ≤900px, columns collapse to one and `.side` becomes static.

### 9.2 `AboutBio/AboutAvatar.tsx` — server

```tsx
import Image from 'next/image';
import styles from './_AboutBio.module.scss';

export function AboutAvatar({ tag, alt }: { tag: string; alt: string }) {
  return (
    <div className={styles.avatar}>
      <Image
        src="/me.jpg"
        alt={alt}
        width={1024}
        height={1024}
        priority
        className={styles.avatarImage}
        sizes="(max-width: 640px) 80vw, (max-width: 900px) 40vw, 30vw"
      />
      <span className={styles.avatarTag}>{tag}</span>
    </div>
  );
}
```

CSS: striped diagonal background as fallback (`repeating-linear-gradient(135deg, var(--paper-deep) 0 12px, var(--paper) 12px 24px)`), `aspect-ratio: 4/5` desktop / `1/1` at ≤640px, 1px hairline inset border via `::after`, image absolutely positioned with `object-fit: cover; filter: grayscale(0.4) contrast(1.05)`. Tag is a relative pill with `background: var(--bg); padding: 8px 14px; border-radius: 999px; z-index: 2;`. Removes the legacy `onerror="this.style.display='none'"` JS — `next/image` doesn't need it.

`priority` passed because the portrait is the LCP candidate on `/about` on most viewports.

### 9.3 `AboutBio/AboutCard.tsx` — server

```tsx
import type { AboutCardData } from '../../../_types/about';
import styles from './_AboutBio.module.scss';

export function AboutCard({ card }: { card: AboutCardData }) {
  return (
    <div className={styles.card}>
      <span className={styles.cardLabel}>{card.label}</span>
      <span className={styles.cardValue}>
        {card.lines.map((line, i) => (
          <span key={i} className={i === card.accentLineIndex ? 'accent' : undefined}>
            {line}
            {i < card.lines.length - 1 && <br />}
          </span>
        ))}
      </span>
    </div>
  );
}
```

CSS: `background: var(--paper); border-radius: 4px; padding: 28px;` (20px at ≤640px), label uses `--font-mono` uppercase 1.1rem, value uses `--font-display` 2.6rem (2.2rem at ≤640px) line-height 1.1 uppercase weight 500.

### 9.4 `AboutBio/_AboutBio.module.scss`

Ports `about.html:13–96` and the bio-related breakpoints from `:229–262`. Single module shared by `AboutBio`, `AboutAvatar`, and `AboutCard` because all three only render inside the bio block.

Class map:

| Module class   | Legacy class              |
| -------------- | ------------------------- |
| `.bio`         | `.about-bio`              |
| `.side`        | `.about-bio__side`        |
| `.body`        | `.about-bio__body`        |
| `.avatar`      | `.about-bio__avatar`      |
| `.avatarImage` | `.about-bio__avatar img`  |
| `.avatarTag`   | `.about-bio__avatar .tag` |
| `.card`        | `.about-bio__card`        |
| `.cardLabel`   | `.about-bio__card .label` |
| `.cardValue`   | `.about-bio__card .value` |

Body font sizing: `clamp(1.9rem, 2vw, 2.6rem)` line-height `1.45` weight `300`; paragraphs `max-width: 36ch; margin-bottom: 1.2em;`.

### 9.5 `Skills/Skills.tsx` — server

```tsx
import { Reveal } from '../../../_components/Reveal/Reveal';
import { SkillGroup } from './SkillGroup';
import type { SkillGroupData } from '../../../_types/about';
import styles from './_Skills.module.scss';

type Props = { groups: readonly SkillGroupData[] };

export function Skills({ groups }: Props) {
  return (
    <div className={styles.skills}>
      {groups.map((g, i) => (
        <Reveal key={g.name} delay={((i + 1) % 5 || 1) as 1 | 2 | 3 | 4 | 5}>
          <SkillGroup group={g} />
        </Reveal>
      ))}
    </div>
  );
}
```

CSS: `display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(20px, 3vw, 56px) clamp(40px, 6vw, 96px); margin-top: 32px;` — collapses to single column at ≤900px.

### 9.6 `Skills/SkillGroup.tsx` — server (flat)

```tsx
import type { SkillGroupData } from '../../../_types/about';
import styles from './_Skills.module.scss';

export function SkillGroup({ group }: { group: SkillGroupData }) {
  return (
    <div className={styles.group}>
      <h3 className={styles.groupName}>{group.name}</h3>
      <div className={styles.tags}>
        {group.tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
```

CSS for `.tag`: `font-family: var(--font-display); font-size: clamp(2.6rem, 3vw, 4rem); text-transform: uppercase; font-weight: 500; line-height: 1; padding-right: 14px; border-right: 1px solid var(--rule-strong);`. Last child drops the border via `&:last-child { border-right: 0; padding-right: 0; }`.

At ≤640px, `.tag` font-size drops to `2.4rem` and padding-right to `10px`. At ≤380px guardrail, drop to `2.2rem` to keep `PostgreSQL` inside the column.

**Important:** these spans are **not** `<Tag>` components. Different visual language — display font + hairline divider, not mono pill. See plan §Decisions.

### 9.7 `Personal/Personal.tsx` — server

```tsx
import { Reveal } from '../../../_components/Reveal/Reveal';
import type { PersonalData } from '../../../_types/about';
import styles from './_Personal.module.scss';

export function Personal({ content }: { content: PersonalData }) {
  return (
    <Reveal className={styles.personal}>
      <h3 className={styles.heading}>
        {content.headingLines.map((line, i) => (
          <span key={i} className={i === content.accentLineIndex ? 'accent' : undefined}>
            {line}
            {i < content.headingLines.length - 1 && ' '}
          </span>
        ))}
      </h3>
      <div className={styles.body}>
        <p>{content.body}</p>
      </div>
    </Reveal>
  );
}
```

Note: `headingLines` joined with a space (not `<br/>`) — legacy renders "Outside" + " " + "of code." inline (`<h3>Outside <span class="accent">of code.</span></h3>`).

CSS: two-column grid (1fr / 1.4fr), gap `clamp(40px, 6vw, 120px)`, `padding: clamp(60px, 8vw, 120px) 0`, `border-top: 1px solid var(--rule-strong)`. Heading `clamp(3.2rem, 4vw, 5.4rem)` uppercase line-height 1. Body `clamp(1.6rem, 1.5vw, 1.9rem)` line-height 1.5 color `var(--fg-soft)` max-width 56ch. Collapses to single column at ≤900px.

### 9.8 `ResumeCTA/ResumeCTA.tsx` — server

```tsx
import { Reveal } from '../../../_components/Reveal/Reveal';
import { Button } from '../../../_components/Button/Button';
import type { ResumeCtaData } from '../../../_types/about';
import styles from './_ResumeCTA.module.scss';

export function ResumeCTA({ content }: { content: ResumeCtaData }) {
  return (
    <Reveal className={styles.resume}>
      <div>
        <h3 className={styles.title}>
          {content.headingLines.map((line, i) => (
            <span key={i} className={i === content.accentLineIndex ? 'accent' : undefined}>
              {line}
              {i < content.headingLines.length - 1 && <br />}
            </span>
          ))}
        </h3>
        <p className={styles.sub}>{content.sub}</p>
      </div>
      <Button href={content.ctaHref} variant="accent" external downloadArrow className={styles.cta}>
        {content.ctaLabel}
      </Button>
    </Reveal>
  );
}
```

Open question: does Phase 3's `<Button>` support a "down-arrow instead of right-arrow" variant? Legacy uses `<span class="arrow">↓</span>`. If `<Button>` only exposes `arrow` (right-arrow), add a `downloadArrow?: boolean` prop in this phase OR render the link manually with the down arrow.

**Decision:** render the resume button manually. Inspecting Phase 3's `<Button>` would shift the spec — let's keep it simple:

```tsx
<a
  href={content.ctaHref}
  target="_blank"
  rel="noopener noreferrer"
  className={`btn btn--accent ${styles.cta}`}
>
  {content.ctaLabel}
  <span className="arrow" aria-hidden="true">
    ↓
  </span>
</a>
```

Class `btn btn--accent` is the global Phase 3 button styling (exposed in `_utils.scss` per Phase 2 spec). If the global classes aren't available — i.e. Phase 3's `<Button>` doesn't expose its styling as globals — then either:

(a) Add a `downloadArrow?: boolean` prop on `<Button>` in this phase, or
(b) Copy the button styling into `_ResumeCTA.module.scss`.

Default: (a). Add the prop in `<Button>`. One-line change. Verify when implementation starts; if Phase 3's `<Button>` exposes `arrow?: ReactNode` already, even simpler — pass `arrow={<span aria-hidden="true">↓</span>}`.

CSS for `.resume`: background `var(--fg)`, color `var(--bg)`, border-radius 6px, padding `clamp(40px, 5vw, 80px)`, grid `1.4fr / 1fr`, gap 40px, align-items center, position relative, overflow hidden. `.title` is `--font-display` `clamp(4.4rem, 7vw, 9rem)` uppercase line-height 0.95 weight 500. `.sub` is 1.6rem line-height 1.55 margin-top 16px color `color-mix(in srgb, var(--bg) 72%, transparent)` max-width 44ch. `::after` renders a giant `CV` glyph absolutely positioned (`right: -30px; bottom: -40px; font-size: 28rem;`) coloured `color-mix(in srgb, var(--bg) 6%, transparent)`. Collapses to single column at ≤900px (`.cta` justifies start).

### 9.9 `ContactAside/ContactAside.tsx` — server

```tsx
import { DirectLink } from './DirectLink';
import type { ContactContent } from '../../../_types/contact';
import styles from './_ContactAside.module.scss';

export function ContactAside({ content }: { content: ContactContent['aside'] }) {
  return (
    <aside className={styles.aside}>
      <h2 className={styles.heading}>
        {content.heading.replace(/\.$/, '')}
        <span className="accent">.</span>
      </h2>
      <p className={styles.body}>{content.body}</p>
      <div className={styles.list}>
        {content.direct.map((d) => (
          <DirectLink key={d.label} data={d} />
        ))}
      </div>
    </aside>
  );
}
```

The trailing `.` of the heading is rendered as an accent span (matches legacy `<span style="color: var(--accent)">.</span>`). The `.replace(/\.$/, '')` strips the literal `.` from the content string before re-adding it as an accent span.

CSS: `display: flex; flex-direction: column; gap: 36px;`. Heading uses `--font-display` `clamp(3rem, 3.6vw, 4.8rem)` uppercase weight 500 line-height 1.

### 9.10 `ContactAside/DirectLink.tsx` — server (flat)

```tsx
import { Arrow } from '../../../_components/Arrow/Arrow';
import type { DirectLinkData } from '../../../_types/contact';
import styles from './_ContactAside.module.scss';

export function DirectLink({ data }: { data: DirectLinkData }) {
  return (
    <a
      href={data.href}
      target={data.external ? '_blank' : undefined}
      rel={data.external ? 'noopener noreferrer' : undefined}
      className={styles.direct}
      data-cursor="hover"
    >
      <span className={styles.directLabel}>{data.label}</span>
      <span className={styles.directValue}>{data.value}</span>
      <span className={styles.directArrow} aria-hidden="true">
        <Arrow size={14} strokeWidth={1.6} />
      </span>
    </a>
  );
}
```

CSS port from `contact.html:39–86`. Hover: `padding-left: 12px; color: var(--accent);` on `.direct`; arrow circle gains `background: var(--accent); color: var(--accent-ink); border-color: var(--accent); transform: rotate(-45deg);`. Transitions wrapped in `@include reduced-motion-safe`.

The first `.direct` has a `border-top: 1px solid var(--fg)` (legacy line 43 — `.direct-list`). The Phase 5 module mirrors this with `.list { border-top: 1px solid var(--fg); }`.

`data-cursor="hover"` is the marker Phase 3's `<CustomCursor>` looks for to grow the ring. Same pattern as Phase 4 work rows.

### 9.11 `ContactForm/ContactForm.tsx` — client

```tsx
'use client';

import { useCallback, useRef, useState } from 'react';
import { TopicChips } from './TopicChips';
import { FormSuccess } from './FormSuccess';
import { Arrow } from '../../../_components/Arrow/Arrow';
import { contactSchema } from '../../../_lib/contact-schema';
import type { ContactContent } from '../../../_types/contact';
import type { ContactFormErrors, ContactFormState, TopicValue } from '../../../_types/contact';
import styles from './_ContactForm.module.scss';

type Props = { content: ContactContent['form'] };

export function ContactForm({ content }: Props) {
  const [state, setState] = useState<ContactFormState>({ status: 'idle' });
  const [topic, setTopic] = useState<TopicValue | ''>('');
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (state.status === 'submitting') return;
      setFormError(null);

      const form = e.currentTarget;
      const formData = new FormData(form);
      const raw = {
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        topic: String(formData.get('topic') ?? ''),
        message: String(formData.get('message') ?? ''),
        company: String(formData.get('company') ?? ''),
      };

      // Client-side validation — same Zod schema as the server.
      const parsed = contactSchema.safeParse(raw);
      if (!parsed.success) {
        const errors: ContactFormErrors = {};
        for (const issue of parsed.error.issues) {
          const field = issue.path[0] as keyof ContactFormErrors;
          if (field && field !== 'company') errors[field] = issue.message;
        }
        setState({ status: 'error', errors });
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
          form.querySelector<HTMLElement>(`[name="${firstErrorField}"]`)?.focus();
        }
        return;
      }

      setState({ status: 'submitting' });
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
          signal: controller.signal,
        });
        const json: unknown = await res.json();

        if (!res.ok) {
          if (
            typeof json === 'object' &&
            json !== null &&
            'error' in json &&
            (json as Record<string, unknown>).error === 'VALIDATION'
          ) {
            const fieldErrors =
              (json as { fieldErrors?: Record<string, string[]> }).fieldErrors ?? {};
            const errors: ContactFormErrors = {};
            for (const [k, msgs] of Object.entries(fieldErrors)) {
              if (k !== 'company') errors[k as keyof ContactFormErrors] = msgs[0];
            }
            setState({ status: 'error', errors });
          } else {
            setFormError(
              'Something went wrong on my end. Try again, or email me directly at m.main2402@gmail.com.',
            );
            setState({ status: 'error', errors: {} });
          }
          return;
        }

        const data = json as { success: boolean; data?: { id: string } };
        setState({ status: 'success', id: data.data?.id ?? 'unknown' });
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setFormError("Couldn't reach the server. Check your connection and try again.");
        setState({ status: 'error', errors: {} });
      }
    },
    [state.status],
  );

  const onReset = useCallback(() => {
    formRef.current?.reset();
    setTopic('');
    setState({ status: 'idle' });
    setFormError(null);
  }, []);

  if (state.status === 'success') {
    return <FormSuccess content={content.success} />;
  }

  const errors = state.status === 'error' ? state.errors : {};

  return (
    <form
      ref={formRef}
      className={styles.form}
      noValidate
      onSubmit={onSubmit}
      aria-busy={state.status === 'submitting'}
    >
      <div className={styles.head}>
        <span className={styles.title}>{content.title}</span>
        <button type="button" className={styles.reset} onClick={onReset}>
          {content.reset.label}
        </button>
      </div>

      <div className={styles.row}>
        <Field
          id="name"
          label={content.fields.name}
          type="text"
          autoComplete="name"
          error={errors.name}
        />
        <Field
          id="email"
          label={content.fields.email}
          type="email"
          autoComplete="email"
          error={errors.email}
        />
      </div>

      <div className={styles.field}>
        <label id="topic-label">
          <span className={styles.num}>{content.fields.topic.num}</span>
          {content.fields.topic.label}
        </label>
        <TopicChips
          options={content.fields.topic.options}
          value={topic}
          onChange={setTopic}
          error={errors.topic}
          labelledBy="topic-label"
        />
        <input type="hidden" name="topic" value={topic} />
        {errors.topic && (
          <p className={styles.error} id="topic-error" role="alert">
            {errors.topic}
          </p>
        )}
      </div>

      <Field id="message" label={content.fields.message} textarea error={errors.message} />

      {/* Honeypot — visually hidden, autocomplete off, tabindex -1. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="company">Company (leave blank)</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}

      <div className={styles.submit}>
        <span className={styles.submitNote}>{content.submit.note}</span>
        <button type="submit" className="btn" disabled={state.status === 'submitting'}>
          {state.status === 'submitting' ? 'Sending…' : content.submit.label}
          <span className="arrow" aria-hidden="true">
            <Arrow size={14} strokeWidth={1.6} />
          </span>
        </button>
      </div>
    </form>
  );
}

/* Internal helper component, declared in the same file to avoid one-line splits. */
function Field({
  id,
  label,
  type = 'text',
  autoComplete,
  textarea,
  error,
}: {
  id: string;
  label: { num: string; label: string; placeholder?: string };
  type?: string;
  autoComplete?: string;
  textarea?: boolean;
  error?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        <span className={styles.num}>{label.num}</span>
        {label.label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={id}
          placeholder={label.placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={label.placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        />
      )}
      {error && (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

Notes:

- `noValidate` on the form so browser validation UI doesn't compete with Zod-driven errors.
- `aria-busy` set during submit so assistive tech knows the form is in flight.
- Validation runs on submit. Errors flip a per-field state; the first invalid field gets focus.
- The honeypot lives inside a `.sr-only` wrapper. `aria-hidden="true"` on the container plus `tabindex={-1}` on the input keeps screen readers and keyboard users away.
- Loading state disables submit (prevents double-submits) and changes label to `Sending…`.
- `formError` is a top-level error band for non-validation failures (network down, 5xx). Validation errors flow through `errors`.
- On success, the whole form is replaced with `<FormSuccess />`.

### 9.12 `ContactForm/TopicChips.tsx` — client (flat)

```tsx
'use client';

import { useRef } from 'react';
import type { TopicOption, TopicValue } from '../../../_types/contact';
import styles from './_ContactForm.module.scss';

type Props = {
  options: readonly TopicOption[];
  value: TopicValue | '';
  onChange: (value: TopicValue) => void;
  error?: string;
  labelledBy: string;
};

export function TopicChips({ options, value, onChange, error, labelledBy }: Props) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusByIndex = (i: number) => {
    const total = options.length;
    const next = ((i % total) + total) % total;
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      focusByIndex(index + 1);
      onChange(options[(index + 1) % options.length].value);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      focusByIndex(index - 1);
      onChange(options[(index - 1 + options.length) % options.length].value);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusByIndex(0);
      onChange(options[0].value);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusByIndex(options.length - 1);
      onChange(options[options.length - 1].value);
    }
  };

  return (
    <div
      className={styles.chips}
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={error ? 'topic-error' : undefined}
    >
      {options.map((opt, i) => {
        const checked = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked || (!value && i === 0) ? 0 : -1}
            className={[styles.chip, checked ? styles.isActive : ''].filter(Boolean).join(' ')}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
```

Notes:

- Proper `role="radio"` per chip; only the active one (or first one when none selected) has `tabIndex={0}`. Arrow keys cycle through and update both focus and value.
- `aria-labelledby` points to the visible label from `ContactForm`.
- Default "no selection" state keeps the first chip tab-stoppable so a keyboard user can still enter the group.

### 9.13 `ContactForm/FormSuccess.tsx` — server (flat)

```tsx
import Link from 'next/link';
import type { ContactContent } from '../../../_types/contact';
import styles from './_ContactForm.module.scss';

export function FormSuccess({ content }: { content: ContactContent['form']['success'] }) {
  return (
    <div className={styles.success} aria-live="polite">
      <h3 className={styles.successTitle}>
        {content.titleLines.map((line, i) => (
          <span key={i} className={i === content.accentLineIndex ? 'accent' : undefined}>
            {line}
            {i < content.titleLines.length - 1 && ' '}
          </span>
        ))}
      </h3>
      <p className={styles.successBody}>{content.body}</p>
      <div className={styles.successActions}>
        <Link href={content.ctaHref} className="btn btn--ghost">
          {content.ctaLabel}
        </Link>
      </div>
    </div>
  );
}
```

Notes:

- The legacy puts inline styles on the ghost button to override colours (`style="color: var(--bg); border-color: var(--bg);"`) because the success card has a dark background. We can't use inline styles. Instead, `.success .btn--ghost` selector inside `_ContactForm.module.scss` overrides the ghost button's colour + border for this nested usage. (`:global(.btn--ghost) { … }` inside a CSS module to reach the global class.)
- `aria-live="polite"` announces the success state to screen readers.
- `headingLines` joined by space (legacy `<h3>Message <span class="accent">sent.</span></h3>`).

### 9.14 `ContactForm/_ContactForm.module.scss`

Ports `contact.html:88–240` for the form + success styles. Class map:

| Module class      | Legacy                                       |
| ----------------- | -------------------------------------------- |
| `.form`           | `.form`                                      |
| `.head`           | `.form__head`                                |
| `.title`          | `.form__head .title`                         |
| `.reset`          | `.form__head .reset`                         |
| `.field`          | `.field`                                     |
| `.row`            | `.field__row`                                |
| `.num`            | `.field label .num`                          |
| `.chips`          | `.form__chips`                               |
| `.chip`           | `.form__chips button`                        |
| `.isActive`       | `.form__chips button.is-active`              |
| `.submit`         | `.form__submit`                              |
| `.submitNote`     | `.form__submit__note`                        |
| `.success`        | `.form__success.is-show`                     |
| `.successTitle`   | `.form__success__title`                      |
| `.successBody`    | `.form__success__body`                       |
| `.successActions` | (new — replaces the legacy inline-style div) |
| `.error`          | NEW — per-field error region                 |
| `.formError`      | NEW — top-level error band                   |

The animated dot on `.head .title::before` reuses the global `nav-pulse` animation already in `globals.scss` (kept by Phase 4 Rev 2).

Reduced-motion gates wrap: `.direct` hover transition (in `_ContactAside.module.scss`), `.reset` colour transition, input focus border colour transition, FAQ marker rotation transition.

### 9.15 `FAQ/FAQ.tsx` — server

```tsx
import type { FaqItem } from '../../../_types/contact';
import styles from './_FAQ.module.scss';

type Props = { items: readonly FaqItem[] };

export function FAQ({ items }: Props) {
  return (
    <div className={styles.faq}>
      {items.map((item, i) => (
        <details key={i} className={styles.item}>
          <summary>
            <span>{item.question}</span>
            <span className={styles.plus} aria-hidden="true" />
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
```

CSS: ports `contact.html:242–292`. `.faq { border-top: 1px solid var(--fg); }`. Each `details.item` has `border-bottom: 1px solid var(--rule-strong); padding: 20px 0;`. `summary` removes the native marker (`list-style: none; &::-webkit-details-marker { display: none; }`), uses `--font-display` `clamp(2.4rem, 2.8vw, 3.4rem)` uppercase weight 500. `.plus` is a 28×28 box with two pseudo-elements forming a `+`; on `details[open]`, the vertical bar rotates 90deg via transform (gated by `reduced-motion-safe`).

## 10. The `Experience` promotion

Three file moves (use `git mv` to preserve history):

```bash
git mv app/_components/home/Experience/Experience.tsx              app/_components/Experience/Experience.tsx
git mv app/_components/home/Experience/XpRow.tsx                   app/_components/Experience/XpRow.tsx
git mv app/_components/home/Experience/_Experience.module.scss     app/_components/Experience/_Experience.module.scss
```

Then one edit to `app/page.tsx`:

```diff
- import { Experience } from './_components/home/Experience/Experience';
+ import { Experience } from './_components/Experience/Experience';
```

The directory `app/_components/home/Experience/` becomes empty; `git rm -r app/_components/home/Experience` after the move. Each `.tsx` inside the moved folder has relative imports of `../../../_types/home` and `../../Reveal/Reveal` — both resolve identically from the new location (one fewer `..` is **not** needed; the import paths from `app/_components/Experience/...` to `app/_types/...` and `app/_components/Reveal/...` are the same number of segments as from `app/_components/home/Experience/...`).

This move is its own commit so any breakage is fast to revert. Verify with `npx tsc --noEmit` after the commit.

## 11. Edge cases

| Case                                                                     | Behaviour                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `RESEND_API_KEY` / `CONTACT_FROM` / `CONTACT_TO` not set in `.env.local` | Route returns `503` with `{ error: 'CONTACT_NOT_CONFIGURED' }`. The form's `formError` slot displays a friendly fallback ("Reach me directly at m.main2402@gmail.com — the form's offline right now.") plus a `mailto:` link.                                                                                                        |
| User hits Send with everything empty                                     | Client-side Zod fails on name, email, topic, message. Each field gets a red error message under it; focus moves to the first invalid field; submit button is **not** disabled.                                                                                                                                                       |
| User pastes an absurdly long message (4001+ chars)                       | Client-side validation rejects with "Message is too long — keep it under 4000 characters." Server validates the same way, defence-in-depth.                                                                                                                                                                                          |
| User submits, network drops mid-fetch                                    | `fetch` rejects with a non-Abort error. `formError` displays `"Couldn't reach the server. Check your connection and try again."` Form state returns to `{ status: 'error', errors: {} }` — the inputs retain their values so the user can retry.                                                                                     |
| User submits, hits Back, then submits again                              | `AbortController` aborts the in-flight first request. The second `fetch` is independent.                                                                                                                                                                                                                                             |
| User unmounts the form mid-submit (clicks a nav link)                    | `AbortError` is caught and swallowed in the `try/catch`. `setState` doesn't fire (the component is gone, but React will warn rather than crash; in practice we never see the warning because the abort is fast).                                                                                                                     |
| Honeypot field filled by a bot                                           | Zod rejects with `company` length > 0. Route detects "only `company` failed" → returns `{ success: true, data: { id: 'noop' } }`. The bot sees a 200 and moves on. No email sent.                                                                                                                                                    |
| Honeypot field filled by a browser autofill                              | False positive — the user thinks they submitted; nothing happens server-side. Risk mitigated by `autoComplete="off"`, `tabindex="-1"`, `aria-hidden="true"`, and a `.sr-only` wrapper that uses `clip-path` to hide rather than `display: none`. If this becomes a real problem (we'd hear it from a real user), strip the honeypot. |
| User selects a topic, navigates away, comes back via browser-back        | Form state is lost (component unmounted). Re-mounted form starts at `{ status: 'idle' }`. No persistence on form state — matches legacy.                                                                                                                                                                                             |
| Topic chip keyboard navigation when none selected                        | First chip is the tab-stop (`tabIndex={0}`). Arrow keys move and select. Tab leaves the group.                                                                                                                                                                                                                                       |
| Submit succeeds with a Resend-returned id                                | `state.status` becomes `success`; the success card replaces the form. `aria-live="polite"` announces it. No auto-revert.                                                                                                                                                                                                             |
| User refreshes after success                                             | Form re-renders fresh in idle state. Success is not persisted (matches legacy and is desired — the user already got confirmation).                                                                                                                                                                                                   |
| About portrait fails to load (`me.jpg` missing or corrupt)               | `next/image` does not provide a built-in `onError` swap. Fallback: the striped diagonal background underneath the absolutely-positioned image stays visible. If `me.jpg` ships broken, the about page degrades to the striped block — graceful. (If a JS-driven fallback is wanted later, that's a Phase 7 polish.)                  |
| FAQ accordion opened with screen reader                                  | Native `<details>` announces "collapsed / expanded" state automatically. No extra ARIA.                                                                                                                                                                                                                                              |
| Email contains characters that trip Resend's subject sanitiser           | Resend SDK handles encoding. If a send fails for any reason, the route returns 502 with `detail` set to the SDK's error message. Client renders the generic `formError`.                                                                                                                                                             |
| `replyTo` set to a non-email-looking string                              | Won't happen — Zod validates `email` with `.email()`. Safe.                                                                                                                                                                                                                                                                          |
| 320px viewport                                                           | Page intro display floor honoured (futureWorks.md:9). Form gap shrinks (`@media ≤640px`). Direct-link label width drops to `56px`. Form padding 24px/20px. FAQ summary font-size 2rem. Skills tag font-size 2.4rem then 2.2rem at ≤380px.                                                                                            |
| `prefers-reduced-motion: reduce`                                         | Direct-link hover-slide skipped (final state = inset 12px on hover, but without transition). FAQ plus rotation snaps. Input focus border colour switches without transition. Success card appears without slide. Reveal-on-scroll Phase 4 behaviour unchanged (already gated).                                                       |

## 12. SEO / metadata

Each page exports its own `metadata`:

```ts
// app/about/page.tsx
export const metadata = {
  title: 'About · Mainul Islam',
  description:
    'Frontend developer working remotely since 2019. Specialised in A/B testing and experimentation.',
};

// app/contact/page.tsx
export const metadata = {
  title: 'Contact · Mainul Islam',
  description:
    'Available for new A/B testing and frontend projects. Send a message or email directly.',
};
```

Both override the layout-level title set in Phase 1. OG / Twitter / robots remain Phase 7.

## 13. Accessibility checklist

- [ ] One `<h1>` per page: `PageIntro` on About and Contact.
- [ ] Heading order: h1 (PageIntro) → h2 (SectionHead titles, ContactAside heading) → h3 (skill groups, xp roles, personal heading, resume heading, FAQ summaries, success card title).
- [ ] `<main>` skip-link still works.
- [ ] About portrait `<img>` has a meaningful `alt`. The decorative striped fallback wrapper is `aria-hidden="true"`.
- [ ] About cards: label/value pairs have visible labels; no orphan `aria-label`.
- [ ] Skills tags are decorative styling on real h3-titled groups — no aria needed.
- [ ] Contact aside heading carries an accent dot; the dot text content stays in the DOM (`.accent` span with literal `.`) so screen readers read "Direct lines." (not "Direct lines" without punctuation).
- [ ] DirectLink: external links have `target="_blank" rel="noopener noreferrer"` and a textual "↗" indicator visually; the arrow SVG is `aria-hidden`.
- [ ] Form: every field has a visible `<label>` linked via `htmlFor`/`id`.
- [ ] Form errors use `aria-describedby={errorId}` + `aria-invalid` + `role="alert"`.
- [ ] Top-level `formError` is `role="alert"`.
- [ ] Topic chips: `role="radiogroup"`, `role="radio"`, `aria-checked`, arrow-key navigation, single tab-stop in the group.
- [ ] Submit button is not disabled when invalid (only during submitting, when its label is `Sending…` and `aria-busy` is on the form).
- [ ] Honeypot: `.sr-only` wrapper, `aria-hidden="true"`, `tabindex={-1}`, `autoComplete="off"`.
- [ ] Success card: `aria-live="polite"`.
- [ ] FAQ: native `<details>` (no ARIA).
- [ ] Touch targets ≥44×44 CSS pixels on chips, direct-link arrows, FAQ summaries, submit button at ≤640px.
- [ ] All decorative SVGs (`Arrow`) are `aria-hidden`.
- [ ] All transitions wrapped in `@include reduced-motion-safe`.
- [ ] Lighthouse a11y on `/about` and `/contact` = 100.

## 14. Verification checklist

Run before merging:

1. `npm run build` clean.
2. `npx tsc --noEmit` clean.
3. `npm run lint` clean.
4. Dev server visual:
   - `/about` renders all sections in order: PageIntro, AboutBio (portrait + cards + bio), Skills, Experience, Personal, ResumeCTA. Footer reads `Let's talk —`. Nav `03 / About` is active.
   - `/contact` renders: PageIntro, ContactAside (3 direct lines), ContactForm (4 fields + 4 chips + submit), FAQ (4 items). Footer reads `Or just say hi —`. Nav `04 / Contact` is active.
   - Hover each `DirectLink` → padding insets 12px, label + arrow turn accent, arrow circle fills + rotates -45deg.
   - Hover each skill tag — no special hover (matches legacy).
   - Tab through Contact form — every input + chip + submit reachable, visible focus.
   - Topic chips: arrow keys cycle; Home jumps to first; End jumps to last.
   - Submit empty form → 4 errors render; first invalid field focused.
   - Submit with valid data **and `.env.local` set up** → email lands in inbox; form swaps to success card.
   - Submit with invalid `RESEND_API_KEY` (e.g. wrong value) → top-level `formError` shows.
   - Set the honeypot to `"foo"` in DevTools → submit returns 200 silently; no email.
   - Reset button → form clears, chip selection cleared, focus state reset.
   - Open each FAQ accordion → plus rotates; body reveals.
5. `prefers-reduced-motion: reduce` (DevTools → Rendering):
   - DirectLink hover snaps without slide.
   - FAQ plus snaps to cross without rotation tween.
   - Input focus border colour switches instantly.
   - Success card appears immediately.
6. 320px viewport:
   - No horizontal overflow on either page.
   - Skills tags fit in column.
   - Form is single-column.
   - DirectLink label readable.
7. Lighthouse a11y on `/about` and `/contact` = 100.
8. Resend dashboard: confirm at least one test email landed and was opened.
9. `futureWorks.md` updates:
   - Log: rate-limiting on `/api/contact` deferred — flag for follow-up after a month if spam appears.
   - Log: `/cv.pdf` self-hosting deferred to Phase 7 (the three call sites are commented).
   - Log: HTML email template for Resend deferred (plain text only).
   - Log: portrait `onError` fallback (visible if `me.jpg` 404s) not wired — striped background degrades gracefully.

## 15. Implementation order

Each numbered step is its own commit so the diff stays readable.

1. **Audit deps** — run `/audit-deps` against `zod` and `resend`. Stop and ask if anything surfaces.
2. **Install deps** — `npm install --save zod resend`. Commit `package.json` + `package-lock.json` as `chore: add zod + resend for contact form`.
3. **Promote `Experience`** — `git mv` the three files; update `app/page.tsx` import. Commit as `refactor: promote Experience out of home namespace`. Run `npx tsc --noEmit` to confirm.
4. **Move `<Footer />` out of layout** — edit `app/layout.tsx` to remove the import + mount; add `<Footer />` at the bottom of `app/page.tsx` (home). Commit as `refactor: move Footer mounting from layout into pages`. Visual check: home footer still renders correctly.
5. **`app/_lib/contact-schema.ts`** — Zod schema + types. Commit as `feat(contact): add Zod schema`.
6. **`app/_lib/email.ts`** — Resend wrapper. Commit as `feat(contact): add Resend email wrapper`.
7. **`app/api/contact/route.ts`** — route handler. Commit as `feat(contact): add /api/contact route handler`.
8. **`.env.local.example`** — document env vars. Commit as `chore: add .env.local.example`.
9. **`app/_types/about.ts` + `app/_types/contact.ts`** — type contracts. Commit as `feat(types): add about + contact types`.
10. **Content files** — `about-content.ts`, `contact-content.ts`, `faq-content.ts`. Commit as `feat(content): add about + contact + faq content`.
11. **About components** — in order: `AboutBio` (with `AboutAvatar` + `AboutCard`), `Skills` (with `SkillGroup`), `Personal`, `ResumeCTA`. Commit per component or per logical group.
12. **`app/about/page.tsx`** + `_aboutPage.module.scss`. Commit as `feat(about): wire about page`.
13. **Portrait asset** — drop `public/me.jpg` (or `.webp`). Commit as `chore: add self-hosted portrait`. If the asset isn't ready yet, ship with the striped fallback visible and flag in futureWorks.
14. **Contact components** — `ContactAside` (with `DirectLink`), `ContactForm` (with `TopicChips` + `FormSuccess`), `FAQ`. Commit per component or per logical group.
15. **`app/contact/page.tsx`** + `_contactPage.module.scss`. Commit as `feat(contact): wire contact page`.
16. **End-to-end verification** — §13 + §14.
17. **`futureWorks.md`** updates — §14 step 9.

Sub-agents (`code-reviewer`, `security-reviewer`) before opening the PR.

## 16. Files NOT touched

For absolute clarity:

- All Phase 2 SCSS partials (`app/_styles/{_variables,_mixins,_typography,_utils,globals}.scss`).
- All Phase 3 primitive components (`Nav`, `CustomCursor`, `Container`, `Section`, `SectionHead`, `Reveal`, `Arrow`, `TickRule`, `MonoLabel`, `PageIntro`, `TextLink`, `Tag`, `Loader`).
- Phase 4 home components (other than the `Experience` promotion file moves).
- `app/_lib/site-config.ts`, `app/_lib/motion.ts`, `app/_lib/home-content.ts`, `app/_lib/work-projects.ts`, `app/_lib/accent-swatches.ts`.
- `next.config.ts`, `tsconfig.json`, `mdx-components.tsx`.
- `Mainul's Portfolio/` (read-only reference).

Potential exceptions, called out explicitly:

- **`app/_components/Button/Button.tsx`** — may need a one-line `arrow?: React.ReactNode` prop or a `downloadArrow?: boolean` prop for the ResumeCTA down-arrow. If the existing prop signature already supports it (e.g. via `children` slot), no edit needed. Verify when implementation reaches step 11.
- **`app/_components/Container/Container.tsx`** — needs to accept a `narrow?: boolean` prop if it doesn't already (used by Contact's FAQ section). Verify when implementation reaches step 15.
- **`app/layout.tsx`** — removes the `<Footer />` mount. This is the only structural edit to the layout in this phase.

If any other file in the "NOT touched" list needs to change during implementation, that's a spec breach — stop and amend the spec rather than slip-streaming the change.

## 17. Out of scope (later phases or `futureWorks.md`)

- `/work` index + 3 case studies (Phase 6).
- Self-hosted `cv.pdf` (Phase 7).
- Real favicon, OG image, sitemap, robots, full Metadata API (Phase 7).
- Rate-limiting `/api/contact`.
- HTML email template for Resend.
- Pre-hydration accent application on about/contact (same tracking item as home, futureWorks.md:13).
- A privacy-policy page.
- A `mailto:` fallback link visible at all times next to the form (it's already in the `formError` text when configuration fails; no extra surface needed).
- Resend webhook for delivery status.
- Saving the portrait in multiple sizes (`me-512.jpg`, `me-1024.jpg`) — `next/image` derives responsive sizes from the single 1024×1024 source.
- Dark mode.
- Hero variant analytics (masterplan §849).
