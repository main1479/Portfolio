# Copy overhaul — plain language, full-time positioning, AI signal

## Why this is happening

Right now the site reads like it's only for hire on contract or freelance work. The hero says _"Available for new A/B testing & frontend projects"_, the home end-CTA says _"Now taking on new clients"_, the about page says _"actively taking on new clients"_, and the contact FAQ asks _"How do you charge?"_ (with answers about per-test pricing and retainers). All of that signals **agency-style freelancer**, not someone looking for a full-time role.

The real goal is the opposite priority:

1. **Primary target — full-time remote frontend role.**
2. **Secondary — contract, freelance, and project work still welcome.**

The second gap: the site doesn't say anything about how Mainul uses AI in the actual work. In 2026 that's a real hiring signal — companies aren't asking _"do you use AI?"_ (everyone does), they're asking _"can you use it effectively without losing the plot?"_ AvsB has one passing line (_"AI-paired with Claude Code throughout"_) and that's it.

The third issue: some of the copy is overwritten. Phrases like _"the place where good frontend meets measurable results"_, _"statistically defensible analysis layer"_, _"experimentation programme"_ — they're crafted, but they sound corporate and they don't read fast. Plain words land better.

---

## What changes (and what doesn't)

### Stays the same

- The overall voice — calm, specific, evidence-led. Not stripping out personality.
- All numbers, dates, project facts, and case-study structure.
- The visual design, layout, components — copy only.
- The headline variants on the home hero ("Frontend Developer & Experiments" / "Turning Traffic into Revenue") — those still work for both audiences.
- The 500+ tests, 7 years, 9+ countries proof points.

### Changes — positioning

The sentence-level signal across the site flips from _"available for new client projects"_ to _"open to full-time roles, contract welcome too"_. Concretely:

- Home hero status line, home end-CTA, about-page bio, about-page card, contact page intro, contact FAQ, and every case-study footer heading all get the same repositioning.
- Contact form topic chips add **Full-time role** as the first option. The current options (A/B testing, Frontend build, Product work, Something else) become contract-flavoured options under it.
- The home-page intro paragraph ends on _"open to full-time and contract work"_ instead of _"taking on new clients"_.
- The about-page bio explains the shift honestly: long Conversion.com contract wound down → now looking for a full-time remote frontend role, contract still welcome.

### Changes — AI signal

Added in three places where it's genuine, not bolted on:

- **Home services section** — the third "Product Building" card becomes an "AI-assisted Builds" framing — building and shipping faster _with_ AI tooling, not skipping the thinking.
- **About skills section** — a new "AI-augmented workflow" group: Claude Code, Cursor, prompt engineering, AI pair programming. Placed near the top so it reads as a core skill, not an afterthought.
- **AvsB case study** — the existing passing reference expands into a short paragraph: how AI tooling sped the build, what it didn't do, why the result still holds together. This is the truthful version of the AI signal — not "I used ChatGPT", but "I shipped a 370k-line platform solo by pairing with AI well".
- **Kemon Doctor and Radius case studies** — one-line mention where the work involved AI tooling. Honest, not inflated.

### Changes — plain language

Roughly: cut fancy phrasing where it doesn't earn it. Examples of what gets simpler:

- _"the place where good frontend meets measurable results"_ → _"frontend you can measure"_
- _"experimentation programme"_ → _"experimentation work"_ / _"running experiments"_
- _"statistically defensible analysis layer"_ → _"statistics that hold up"_
- _"I'd love to hear about it"_ → _"send me a note"_
- _"defensible selectors"_ → _"resilient selectors"_ (or kept where the technical reader is the target)

Not stripped: technical terms that are accurate and clear (Optimizely, Kameleoon, Bayesian, edge ingestion, etc.). The simplification rule is _make the marketing copy plain, keep the technical copy technical._

### Changes — FAQs

The four current FAQs lean freelance-only. New FAQ set:

1. _"What are you looking for?"_ — full-time remote frontend role, ideally with experimentation work. Open to contract and freelance too.
2. _"What kinds of teams do you work best with?"_ — product teams, experimentation teams, growth teams. Both agency and end-client experience.
3. _"How do you use AI in your work?"_ — short, specific. Claude Code for production code, Cursor for inline edits, treat AI as a fast collaborator that I still review carefully. Not a black box.
4. _"What time zone do you work in?"_ — kept (factual, useful for remote roles).

The pricing FAQ is removed — it's awkward when full-time is the headline.

### Changes — case-study footer headings

Each case currently has a freelance-coded footer line:

- AvsB: _"Got something to test?"_
- Kemon Doctor: _"Working on something similar?"_
- Radius: _"Got a product to ship?"_
- Client: _"Need an experiment shipped?"_
- Cursimax: _"Got a frontend build in mind?"_
- Flatwhite: _"Got a site to ship?"_

These become more open-ended — usually a variation of _"Want to talk?"_ or _"Let's talk."_ — so they read fine for both a hiring manager and a contract client.

---

## What success looks like

After this pass, the visitor profile shifts. A hiring manager scanning the site for 60 seconds should see:

1. _"Frontend developer, specialises in A/B testing"_ — clear from the hero.
2. _"Open to full-time remote"_ — clear from the hero status line and end-CTA.
3. _"Uses AI tools effectively"_ — clear from the services section, the skills group, and the AvsB case.
4. _"Has actually shipped things"_ — clear from the stats, work index, and case studies (unchanged).

And a contract client landing on the same site should still see all the freelance signals — _contract welcome_, the work index, the case studies, the topic chip on the contact form. Nothing is lost; the priority is just clearer.

---

## Out of scope (futureWorks candidates)

- The CV / résumé PDF (`/Resume_Mainul.pdf`) — same repositioning probably belongs there too, but the PDF is a separate artifact.
- LinkedIn headline — same. Worth syncing manually after this lands.
- OG card text (_"Frontend · A/B Testing"_) — fine as-is, no AI signal needed in metadata.
- Email templates (notification + confirmation) — copy is fine. Topic-label mapping updates when the chip values change, but the email body doesn't need rewriting.

---

## Approval needed

1. Confirm the positioning hierarchy: **full-time remote first, contract second**.
2. Confirm the AI signal goes in three places: services card, about skills, AvsB case (with light mentions in Kemon Doctor + Radius).
3. Confirm the FAQ rewrite (remove pricing FAQ, add full-time + AI FAQs).
4. Confirm the new topic chip set: _Full-time role · Contract / freelance · A/B testing project · Something else._

Once those four are confirmed, the technical spec (`_specs/copy-overhaul-spec.md`) lists every file + line that changes with before/after copy.
