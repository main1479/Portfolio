# Motion pass — bringing the portfolio to life

## Why

Friends who build for the web are saying the current site feels flat compared to the previous portfolio. The previous portfolio's expressive motion (custom contextual cursor, page-transition curtain with rotating messages, text reveals, stagger animations) is what landed the Conversion job in the first place — the tech lead saw the portfolio first and decided the frontend skills were there. The current site, as restrained as it is, is underselling the craft it should be showcasing.

This pass brings expressive motion back, but it isn't full "Awwwards everywhere." Motion lands where it does double duty: as a craft signal **and** on-brand for an A/B testing specialist. Loading messages can speak experiment voice. Case-study scroll reveals can stage the hypothesis → variant → result arc. A custom cursor that labels its destination is a small piece of JS craft that says more than a paragraph could.

One important constraint informs the approach: a previous attempt at a page-transition curtain (sliding panel via GSAP click intercept) was tried and removed in `feature/page-transitions` because it couldn't be made to feel right — perceived lag after click, visible smooth-scroll under the rising panel. This pass goes a different way: the browser-native View Transitions API, which Next 16 exposes. The browser handles the snapshot timing, so the click-lag glitch from before doesn't apply.

## What's being added

### Stage 1 — Page-transition curtain with rotating messages

When you click a link to another route, a panel sweeps across the screen briefly with a short message in the middle, then reveals the new page underneath. The message rotates from a curated list, picked at random per transition. The list mixes three voices so the loading itself becomes a portfolio signal rather than a generic spinner:

- **Personality** (carries the old portfolio's voice forward): "Almost There…", "Please wait…", "Wow, you are here!"
- **Experiment voice** (on-brand for an A/B testing specialist): "Variant A is loading…", "Hypothesis: you'll like this one", "Stat sig: pending…"
- **Light functional context** for users who want orientation: "Next: About", "Loading case study"

The mix skews toward personality (it's what made the old loading feel alive), but the experiment-voice messages quietly do the work of saying "even this person's loading screen is on-message."

### Stage 2 — Contextual cursor labels

Today the cursor is a small dot that grows on hover over any interactive element. The pass upgrades it to a disc that fills with the destination's name when you hover a nav link — the cursor reads "About" when pointed at the About link, "Home" when pointed at Home. Buttons, case-study cards, and other interactive elements get the disc treatment too, with their own short label ("Open", "Read", "Get in touch", etc.).

This is the strongest single piece of frontend craft signal from the old portfolio. It's small but it lands.

### Stage 3 — Work-grid hover choreography

The `/work` index cards currently have a quiet hover state. The pass replaces it with something more expressive — a scaled-up image, a directional reveal of the case-study title, maybe a subtle parallax on the image inside the card. Existing Magnetic and Reveal components stay; this layer sits on top, scoped to the cards.

### Stage 4 — Text and section reveal pass

The current site already has the bones of this:

- `Reveal` handles scroll-fade-ups
- `PageIntro` handles the title reveal on each page load

This stage extends them with three additions:

- **Word-level stagger on the hero headline** — instead of the whole line fading in together, words (or letters) cascade in. The previous portfolio's "PASSIONATE" / "FRONTEND DEVELOPER" treatment is the reference.
- **Section-heading reveals** on scroll — a small layered reveal as each section header enters the viewport.
- **Case-study body reveals** — tighter scroll-tied staging on the hypothesis → variant → result arc so each piece lands as the reader arrives. This is where motion does the most work: the reading rhythm matches the experiment rhythm.

## What stays the same

- Copy voice stays calm and evidence-led — motion does the expressive work, not the words.
- Reduced-motion users (`prefers-reduced-motion: reduce`) still get a static, immediate experience — every animation in the pass guards on it.
- The existing `PageIntro`, `Reveal`, and `Magnetic` components keep their shape — the pass extends them, doesn't replace them.
- The GSAP + ScrollTrigger setup in `app/_lib/motion.ts` stays as the scroll-linked animation backbone; the page-transition curtain is the one piece that uses View Transitions instead.

## What's not in scope (yet)

- **Horizontal scrolling.** Worth a discussion, but situational — better story device in one or two spots (the work index, a single case-study moment) than as a global pattern. Ship the four stages above first, then decide.
- **Background watermark / easter-egg text** (the "You are amazing" from the old portfolio). Decorative content, not motion — handle as a separate small feature if wanted.
- **Custom cursor on every element.** The disc shows on nav, buttons, links, and work-grid cards. Plain-text body content keeps the native cursor — covering everything dilutes the signal.
- **Fake-loading "padding"** that artificially extends the transition past what the browser needs. The curtain is fast — the message gives it character, but the page underneath is ready when the curtain lifts.

## Staging

Each stage is shippable on its own. After Stage 1 the site already feels noticeably more alive; the rest is additive.

1. **Page-transition curtain + rotating messages** — biggest perceived change, most direct response to the "feels flat" feedback.
2. **Contextual cursor labels** — strongest piece of frontend-craft signal, lowest scope.
3. **Work-grid hover choreography** — concentrates expressive motion where users browse the most.
4. **Text and section reveals** — extends what's already there to the hero and case-study bodies.

Each stage ships on its own branch (`feature/motion-1-transitions`, `feature/motion-2-cursor`, etc.) with its own PR. The plan and spec for each can build on this overall plan rather than redo it.

## Decisions to settle in the spec

The technical spec will pin down:

- Final list of rotating curtain messages (with the personality / experiment / functional mix counts)
- Source of the cursor label (data attribute? component prop? aria-label fallback?)
- Curtain visual — solid color block, gradient, or thin sweep
- Timing handoff between curtain message and the `PageIntro` reveal on the destination page (do they overlap or chain?)
- Which case-study sections get the scroll-tied reveal, and the exact stagger shape
- Whether word-level hero stagger uses SplitText (GSAP commercial), a hand-rolled word/letter split, or a CSS-only approach

## Risks and unknowns

- **View Transitions API in Next 16** is `unstable_ViewTransition` — still considered experimental. We accept that, because the alternative (another GSAP click-intercept attempt) is the documented dead-end. If `unstable_ViewTransition` doesn't behave on real builds, fallback is to keep the existing template fade-up and ship Stages 2–4 only.
- **Cursor label readability** at small viewports — the disc is sized for desktop. On touch (`hover: none`) the cursor is already hidden, so this is desktop-only by design.
- **Stage 4 case-study reveals** could interfere with smooth-scroll. We'll test on the longer case pages (AvsB, Kemon Doctor) early to catch any janky scroll handoff before locking the timing.
