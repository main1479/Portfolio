# Copy overhaul — technical spec

Paired with `_plans/copy-overhaul-plan.md`. Every change is a string edit. No new components, no layout changes, no schema migrations except the contact-form topic enum.

---

## 1 · `app/_lib/site-config.ts`

### `ownerRole`

- **Before:** `'Frontend Developer · A/B Testing & Experimentation'`
- **After:** `'Frontend Developer · Open to full-time remote'`

(Used in the page title template, OG card, Twitter card, footer strapline.)

### `footerCta.lead`

Unchanged — `'Say hello —'` is neutral.

---

## 2 · `app/layout.tsx`

### `metadata.description`

- **Before:** `Frontend developer specialised in A/B testing and experimentation. 4+ years across Optimizely, Kameleoon, and Qubit, plus modern frontend with Next.js and TypeScript.`
- **After:** `Frontend developer open to full-time remote roles. 4+ years running A/B tests on Optimizely, Kameleoon, and Qubit. Modern frontend with Next.js and TypeScript. Pairs with AI tools to ship faster without losing the plot.`

### `openGraph.description` — same text as `metadata.description`.

### `twitter.description`

- **Before:** `Frontend developer specialised in A/B testing and experimentation. Builds CLI-driven experimentation platforms and ships conversion experiments for ecommerce + SaaS clients.`
- **After:** `Frontend developer open to full-time remote. Ships A/B tests and modern frontend — on Optimizely, Kameleoon, Qubit, Next.js. Uses AI tools to move fast.`

---

## 3 · `app/_lib/home-content.ts`

### `hero.sub`

- **Before:** `I build and run experiments that turn traffic into revenue — 4+ years across Optimizely, Kameleoon, and Qubit, plus modern frontend with Next.js and TypeScript.`
- **After:** `I build frontend and run A/B tests that turn traffic into revenue. 4+ years on Optimizely, Kameleoon, and Qubit. Modern stack — Next.js, TypeScript, AI-paired workflow.`

### `hero.statusLine`

- **Before:** `Available for new A/B testing & frontend projects`
- **After:** `Open to full-time remote · contract & freelance welcome`

### `hero.ctaLabel`

Unchanged — `Get in touch` works for both audiences.

### `intro.paragraphs` — full rewrite

Replace the three paragraphs with:

1. _"I'm a **frontend developer** working remotely since 2019, looking for a **full-time remote role** where I can build frontend and run experiments. Contract and freelance work welcome too."_

2. _"My focus is **frontend that you can measure** — building reliable **A/B tests and conversion experiments** for real businesses."_

3. _"I've spent the last **4+ years building experiments** on enterprise platforms — Optimizely, Kameleoon, Qubit — alongside modern frontend with React and Next.js. **500+ A/B tests shipped**, and I pair daily with AI tools to move faster without skipping the thinking."_

Segment kinds (`text` / `strong` / `accent`) map naturally to the bold and accent words.

### `marquee.tokens`

Add three AI-relevant tokens. New list:

```
A/B Testing
Conversion Optimization (accent)
Optimizely
Kameleoon
Qubit
Next.js
TypeScript
Claude Code (accent)
Cursor
Experimentation (accent)
```

### `stats`

Unchanged. The three numbers (500+, 7, 9+) are accurate and load-bearing.

### `services.items` — third card rewritten

**Item 03 — current:**

```
titleLines: ['Product', 'Building']
desc: 'Designing and building complete products solo — architecture, frontend, and the systems around them.'
tags: ['Architecture', 'PostgreSQL', 'Drizzle']
```

**Item 03 — new:**

```
titleLines: ['AI-paired', 'builds']
desc: 'Shipping faster by pairing with AI tools — Claude Code, Cursor — while still owning the design, the review, and the result. AvsB (370k lines, solo) is the proof.'
tags: ['Claude Code', 'Cursor', 'Solo product builds']
```

Items 01 and 02 unchanged.

### `selectedClients.intro`

- **Before:** `Through agency work, a sampling of brands I've shipped tests for — across publishing, retail, automotive, gaming, and non-profit.`
- **After:** `Through agency work, a few brands I've shipped tests for — across publishing, retail, automotive, gaming, and non-profit.`

(Trimmed _"a sampling of"_ → _"a few"_.)

### `endCta.headingLines`

Unchanged — _"Let's build something measurable."_ still works.

### `endCta.sub`

- **Before:** `Now taking on new clients. If you have a frontend build or an experimentation programme in mind, I'd love to hear about it.`
- **After:** `Looking for a full-time remote role where I can build frontend and run experiments. Contract and freelance projects welcome too — send me a note.`

### `endCta.ctaLabel`

Unchanged — `Start a conversation`.

---

## 4 · `app/_lib/about-content.ts`

### `bio.cards[0]` (Currently card)

- **Before:** `lines: ['Available for', 'new projects']`
- **After:** `lines: ['Open to', 'full-time roles']`

### `bio.paragraphs` — full rewrite

1. _"I'm a **frontend developer** working remotely since 2019."_

2. _"My focus is **frontend that you can measure** — building reliable **A/B tests and conversion experiments** for real businesses."_

3. _"I started in freelance frontend work and moved steadily toward experimentation — the part of the job where you can **prove** whether a change actually worked. Over the last few years, that adds up to **500+ A/B tests shipped** across ecommerce and SaaS."_

4. _"For the last few years, most of my time went into a long-running contract with **Conversion.com**, building A/B tests on enterprise platforms. That work has wound down, and I'm now **looking for a full-time remote frontend role** — ideally one with experimentation or growth in the mix. Contract and freelance projects are still welcome."_

5. _"I work with **AI tools daily** — Claude Code, Cursor — to move faster on real production work. The point isn't to skip thinking; it's to spend more of the day on the parts that need it."_

6. _"I've worked with startups and individuals across the UK, India, Slovakia, Austria, Australia, and Canada."_

### `skills.groups` — restructured

Replace with:

```
{ name: 'Core', tags: ['JavaScript', 'TypeScript', 'React', 'Next.js'] }
{ name: 'AI-augmented workflow', tags: ['Claude Code', 'Cursor', 'AI pair programming', 'Prompt engineering'] }
{ name: 'Styling', tags: ['SCSS', 'Tailwind', 'Modern CSS'] }
{ name: 'Experimentation', tags: ['Optimizely', 'Kameleoon', 'Qubit', 'CRO'] }
{ name: 'Tooling & Testing', tags: ['Vitest', 'Playwright', 'Git', 'Turborepo'] }
{ name: 'Also working with', tags: ['PostgreSQL', 'Drizzle ORM', 'Node.js', 'ClickHouse'] }
```

AI moves to slot 2 so it reads as a core skill, not a footnote.

### `personal.body`

- **Before:** `Outside of work I run a YouTube channel for quiet travel videos. I'm drawn to mountains and the sea — anywhere a little further from the screen.`
- **After:** Unchanged. Reads well already.

### `resume.sub`

- **Before:** `A one-page PDF with the full picture — roles, dates, tools, and references on request.`
- **After:** Unchanged.

### About page `metadata.description`

In `app/about/page.tsx`:

- **Before:** `Frontend developer working remotely since 2019. Specialised in A/B testing and experimentation.`
- **After:** `Frontend developer working remotely since 2019. Looking for full-time remote roles. A/B testing and experimentation focus.`

(All three places: `metadata.description`, `openGraph.description`, `twitter.description`.)

---

## 5 · `app/_lib/contact-content.ts`

### `pageIntro.sub`

- **Before:** `Available for new A/B testing and frontend projects. Send me a message or email me directly — I usually reply within a day or two.`
- **After:** `Open to full-time remote frontend roles. Contract and freelance projects welcome too. Send a note or email directly — I usually reply within a day or two.`

### `aside.body`

- **Before:** `If a form isn't your thing — here's how to reach me directly. Best for quick questions or referrals.`
- **After:** `If a form isn't your thing — here's how to reach me directly. Best for quick questions, intros, or referrals.`

### `form.fields.topic.options` — full replacement

```
{ value: 'full-time-role', label: 'Full-time role' }
{ value: 'contract-freelance', label: 'Contract / freelance' }
{ value: 'a-b-testing', label: 'A/B testing project' }
{ value: 'something-else', label: 'Something else' }
```

This is the **only schema change**. See §10 for the schema + email-template propagation.

### `form.submit.note`

- **Before:** `↳ I usually reply within 24 hours on weekdays, and within a day or two on weekends.`
- **After:** Unchanged.

### `form.success.body`

- **Before:** `Thanks for reaching out. I'll get back to you as soon as possible. In the meantime, feel free to grab the resume or browse the work index.`
- **After:** `Thanks for reaching out. I'll get back to you within a day or two. In the meantime, feel free to grab the resume or browse the work.`

---

## 6 · `app/_lib/faq-content.ts` — full rewrite

```ts
[
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
      'Daily, but carefully. Claude Code for larger production work, Cursor for inline edits, and AI pair programming when it speeds up a real problem. I treat AI as a fast collaborator I still review — not a black box that ships unread code.',
  },
  {
    question: 'What time zone do you work in?',
    answer:
      'I work remotely on a flexible schedule with plenty of overlap with UK and EU mornings, and US evenings.',
  },
];
```

---

## 7 · `app/work/page.tsx`

### Page intro `sub`

- **Before:** `A mix of experimentation platforms, products, and client experiment work — spanning startups and individuals across nine-plus countries.`
- **After:** Unchanged.

### `metadata.description`

Unchanged.

### Confidentiality paragraph

- **Before:** `Client names appear only with written permission. Anything not listed here stays confidential — that's how this work has to work.`
- **After:** Unchanged.

### Footer heading

- **Before:** `Got a project? — m.main2402@gmail.com`
- **After:** `Let's talk — m.main2402@gmail.com`

---

## 8 · `app/work/<slug>/content.mdx` — footer headings + AI mentions

### `app/work/avsb/content.mdx`

- `footerHeading`: _"Got something to test?"_ → _"Want to talk?"_
- Block 02 (_My role / What I did_) — expand the AI line:
  - **Before (one sentence):** `AI-paired with Claude Code throughout.`
  - **After (one paragraph at the end of the block):**
    > Paired daily with **Claude Code** through the build — sometimes for the heavy lifting (test scaffolding, schema migrations), sometimes just as a fast second pair of eyes on a tricky function. The architecture, the trade-offs, and the code quality bar are still mine. AI made the build faster; it didn't replace the thinking.

### `app/work/kemon-doctor/content.mdx`

- `footerHeading`: _"Working on something similar?"_ → _"Want to talk?"_
- Block 04 (_What I built_) — append one bullet:
  - `- **AI-paired build** — Claude Code for scaffolding and migrations; design decisions stay mine.`

### `app/work/radius/content.mdx`

- `footerHeading`: _"Got a product to ship?"_ → _"Want to talk?"_
- No AI mention added — this is an agency build and the line wouldn't be honest about the team workflow.

### `app/work/client/content.mdx`

- `footerHeading`: _"Need an experiment shipped?"_ → _"Want to talk?"_
- Block 04 (_How I work_) — replace the word `Defensive selectors` with `Resilient selectors` (clearer to non-experts).

### `app/work/cursimax/content.mdx`

- `footerHeading`: _"Got a frontend build in mind?"_ → _"Want to talk?"_

### `app/work/flatwhite/content.mdx`

- `footerHeading`: _"Got a site to ship?"_ → _"Want to talk?"_

---

## 9 · `app/not-found.tsx`

### `metadata.description`

Unchanged.

### Page sub

- **Before:** `That URL doesn't lead anywhere on this site. Try the work index — or head back home.`
- **After:** Unchanged.

---

## 10 · Schema + email-template propagation (only because §5 changed topic values)

### `app/_lib/contact-schema.ts`

```ts
export const TOPIC_VALUES = [
  'full-time-role',
  'contract-freelance',
  'a-b-testing',
  'something-else',
] as const;
```

### `app/_types/contact.ts`

```ts
export type TopicValue = 'full-time-role' | 'contract-freelance' | 'a-b-testing' | 'something-else';
```

### `app/_lib/email-templates/shared.ts` — `TOPIC_LABELS`

```ts
export const TOPIC_LABELS: Record<ContactInput['topic'], string> = {
  'full-time-role': 'Full-time role',
  'contract-freelance': 'Contract / freelance',
  'a-b-testing': 'A/B testing project',
  'something-else': 'Something else',
};
```

Edge case: the existing `'frontend-build'` and `'product-work'` topic values disappear. There's no persistence layer storing past form submissions on the server, so there are no historical rows to migrate — the change is purely UI + email-side.

---

## 11 · `app/contact/_components/ContactForm/ContactForm.tsx`

### Form subhead (inside the form, after the title row)

- **Before:** `If a form isn't your thing — message me directly below.`
- **After:** Removed. The aside has the same line; repeating it inside the form is noise.

(This is a single-element deletion — the `<p className={styles.subhead}>` block.)

### Error messages

- _"Reach me directly at m.main2402@gmail.com — the form's offline right now."_ — unchanged.
- _"Something went wrong on my end. Try again, or email me directly at m.main2402@gmail.com."_ — unchanged.
- _"Couldn't reach the server. Check your connection and try again."_ — unchanged.

---

## 12 · OG cards / Twitter cards

No changes. The big-type OG card says _"Frontend · A/B Testing."_ — that holds for both the full-time and contract audiences.

---

## Files changed (summary)

| File                                                  | Type of change                                                       |
| ----------------------------------------------------- | -------------------------------------------------------------------- |
| `app/_lib/site-config.ts`                             | `ownerRole` string                                                   |
| `app/layout.tsx`                                      | metadata descriptions                                                |
| `app/_lib/home-content.ts`                            | hero, intro, marquee, services[2], selectedClients.intro, endCta.sub |
| `app/_lib/about-content.ts`                           | bio.cards[0], bio.paragraphs, skills.groups                          |
| `app/about/page.tsx`                                  | metadata descriptions                                                |
| `app/_lib/contact-content.ts`                         | pageIntro.sub, aside.body, topic options, success.body               |
| `app/_lib/faq-content.ts`                             | full rewrite (4 → 4 items)                                           |
| `app/work/page.tsx`                                   | footer heading                                                       |
| `app/work/avsb/content.mdx`                           | footerHeading + Block 02 AI paragraph                                |
| `app/work/kemon-doctor/content.mdx`                   | footerHeading + Block 04 bullet                                      |
| `app/work/radius/content.mdx`                         | footerHeading                                                        |
| `app/work/client/content.mdx`                         | footerHeading + 1 word swap                                          |
| `app/work/cursimax/content.mdx`                       | footerHeading                                                        |
| `app/work/flatwhite/content.mdx`                      | footerHeading                                                        |
| `app/_lib/contact-schema.ts`                          | TOPIC_VALUES enum                                                    |
| `app/_types/contact.ts`                               | TopicValue union                                                     |
| `app/_lib/email-templates/shared.ts`                  | TOPIC_LABELS map                                                     |
| `app/contact/_components/ContactForm/ContactForm.tsx` | remove duplicate subhead `<p>`                                       |

18 files. All copy + one enum migration.

---

## Edge cases & verification

1. **Type safety on the topic enum change.** Zod schema, `TopicValue` type, and `TOPIC_LABELS` map all reference the same set of strings — TypeScript will fail loud at build time if any of the four go out of sync. Verify with `npx tsc --noEmit`.

2. **The form's hidden `<input type="hidden" name="topic" value={topic} />`** is wired to the chip state and reads whatever option is selected — no change needed.

3. **MDX `footerHeading` is rendered by the case-study layout's `Footer`** via a `heading` prop. Verified — all six MDX files use the same field name.

4. **The `5-card` skill group delay loop** (`(i % 5) + 1` in `Skills.tsx:12`) caps the stagger at 5 — adding a sixth group is fine; it just restarts the stagger.

5. **The home marquee infinite scroll** doesn't care about token count — adding two tokens is safe.

6. **`/ship` gauntlet** after implementation: `npx tsc --noEmit`, `npm run lint`, `npm run build`, manual visual check on home / about / contact / one case-study page.

7. **Accessibility:** no markup changes, so no new a11y surface. The contact form keeps its existing labels, error regions, and chip keyboard nav.

---

## Out of scope (already flagged in plan)

- CV PDF rewrite.
- LinkedIn headline.
- Email template body text (only the topic label map updates).
- Any new components, motion, or layout work.

---

## Open decisions for approval

Same four from the plan:

1. Positioning hierarchy — **full-time first, contract second**.
2. AI signal placement — **services card + skills group + AvsB case + light Kemon/Doctor mention**.
3. FAQ rewrite — **drop pricing FAQ, add full-time + AI FAQs**.
4. Topic chip set — **Full-time role · Contract / freelance · A/B testing project · Something else**.

After approval, implementation lands on a single branch (`feature/copy-overhaul`) with one commit per logical group (positioning / AI / FAQ / topic-enum), followed by `/ship`.
