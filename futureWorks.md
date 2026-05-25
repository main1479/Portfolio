# Future works

Real gaps and known-deferred work only — not session notes, not "verify X works" reminders for things that already work, not subjective preferences. If a line wouldn't change the site if left undone, it doesn't belong here.

Format: `- [<area>] <description> — <branch or session ref>`

---

## Open

- [tokens] Verify the 320px clamp-down for `.display-xl` and `.page-intro__title` (`clamp(2.6rem, 10vw, 5.2rem)`) on a real first-gen iPhone SE viewport once the hero ships in Phase 4. — `feature/design-tokens` session 2026-05-21
- [build] `next.config.ts` `sassOptions.additionalData` callback is not being applied to component `*.module.scss` under Next 16.2.6 / Turbopack. Phase 3 worked around it with explicit `@use 'mixins' as *;` per component module (contradicts CLAUDE.md line 152 and `.claude/rules/coding-style.md`). Investigate whether to migrate to `prependData`, switch off Turbopack, or accept the per-file `@use` and update the rules. — `feature/layout-shell` session 2026-05-22
- [analytics] Hero variant toggle telemetry (masterplan future ideas §849) — not wired this phase. — `feature/home-page` session 2026-05-22
- [contact] No rate-limiting on `/api/contact`. Revisit after a month if spam appears — add an Upstash single-IP-per-minute counter (or in-memory map) in a follow-up. — `feature/about-and-contact` session 2026-05-22
- [contact] HTML email templates landed in this phase (`app/_lib/email-templates/{notification,confirmation}.ts`). Outstanding email polish: render in real clients (Gmail, Outlook, Apple Mail, Superhuman, mobile Gmail) and tweak any rendering quirks; consider a one-pixel preheader / tracking-pixel removal if the dashboard adds them by default. — `feature/about-and-contact` session 2026-05-22
- [assets] `public/me.jpg` (self-hosted portrait, ≥1024×1024) not yet supplied. About page falls back to the striped diagonal background until a real source is dropped in. — `feature/about-and-contact` session 2026-05-22
- [a11y] About portrait has no JS-driven `onError` swap if `/me.jpg` 404s. `next/image` will render the broken-image alt instead; the striped diagonal background sits behind it as a visual fallback. — `feature/about-and-contact` session 2026-05-22
- [assets] Real case-study screenshots (AvsB dashboard, Kemon Doctor mobile flows) — striped-fill placeholders in `<CaseVisuals>` ship in Phase 6; replace once real screenshots are available. — `feature/work-and-cases` session 2026-05-23
- [content] Radius case copy needs Mainul's sign-off — wider Conversion team should also vet anything that touches NDA territory (taxonomies, client-stakeholder access, beta scope). — `feature/cursimax-and-country-count` session 2026-05-23
- [assets] Radius case uses the deck's "Radius beta" title + share-modal slides (safe content). When Conversion can supply raw product UI screenshots with non-client demo data, swap in for richer visuals. — `feature/cursimax-and-country-count` session 2026-05-23
- [deps] `npm audit` reports 2 moderate (`postcss <8.5.10`, transitive via `next`). Not exploitable in this build context (PostCSS only stringifies build-time author SCSS). Fix would require downgrading Next to 9.3.3 — breaking change. Tracking Next 16.3 stable for an automatic upstream fix. — `feature/polish-and-launch` session 2026-05-23
- [deploy] DNS for `mainul.info` not configured by Phase 7 PR — Vercel domain binding + apex/CNAME records remain a manual outside-the-repo step. — `feature/polish-and-launch` session 2026-05-23
- [responsive] Visual confirmation of the `fix/responsive-issues` SCSS tuning was not performed by Claude this session (no browser-driving tool available). Build / lint / typecheck all pass and all affected routes return 200, but the breakpoint behaviour at 320/380/640/768/900/1100/1300/1500/1640 needs a human eyeball pass on home, /work, /about, /contact, and a case page before merge. — `fix/responsive-issues` session 2026-05-24
- [styles] Unused `.subhead` rule in `app/contact/_components/ContactForm/_ContactForm.module.scss` — the `<p className={styles.subhead}>` element was removed in the copy overhaul but the SCSS class wasn't pruned. Harmless but worth cleaning. — `feature/copy-overhaul` session 2026-05-25
- [cv] Replace `public/CV_Mainul.pdf` with a fresh export from the new `/cv` route. Steps: `npm run dev` → open `http://localhost:3000/cv` → Cmd+P → Save as PDF (A4, default margins, background graphics off) → overwrite the file → commit. — `feature/copy-overhaul` session 2026-05-25
- [copy] LinkedIn headline still uses pre-overhaul framing. Sync to "Frontend Developer · A/B Testing & Experimentation · Open to full-time remote & contract" after the new PDF lands. — `feature/copy-overhaul` session 2026-05-25
- [visual] Copy overhaul typecheck + lint + build all pass, but the rendered home / about / contact / case pages need a human-eyeball pass — the new five-chip topic row at narrow viewports and the new "AI as co-engineer" skills group placement are the highest-risk spots. — `feature/copy-overhaul` session 2026-05-25
- [motion] Sliding panel page-transition was attempted in `feature/page-transitions` and removed before merge — couldn't make it feel right (perceived lag after click, visible smooth-scroll under the rising panel). What shipped: a subtle template-level page fade-up + PageIntro title-reveal on mount. If a heavier route transition is wanted later, the right next attempt is probably Next.js's `unstable_ViewTransition` (browser-handled snapshot timing) rather than another GSAP click intercept. — `feature/page-transitions` session 2026-05-26
- [visual] Template page-enter fade-up and PageIntro title reveal ship green on typecheck + lint + build, but the animations themselves were not visually verified by Claude this session (no browser-driving tool available). Human-eyeball pass needed on every route — `/`, `/about`, `/contact`, `/work`, `/work/avsb`, `/cv` (verify static), `/404` — plus a reduced-motion-on pass. — `feature/page-transitions` session 2026-05-26

## Resolved

(move items here once they're addressed, with the commit or PR that resolved them)

- [routes] `SelectedWork` rows on `/` link to `/work/avsb`, `/work/kemon-doctor`, `/work/client`. Resolved — all three case routes ship in Phase 6. — `feature/work-and-cases` 2026-05-23
- [scaffold] Add a real favicon — `app/icon.svg` + `app/apple-icon.tsx` ship in Phase 7. — `feature/polish-and-launch` 2026-05-23
- [assets] `/cv.pdf` self-hosting — shipped as `/CV_Mainul.pdf` in Phase 7. — `feature/polish-and-launch` 2026-05-23
- [deps] `npm install` reports 2 moderate vulnerabilities — documented exception (transitive `postcss <8.5.10` via `next`; no exploit surface in this build). Tracking Next 16.3 stable. See Open entry. — `feature/polish-and-launch` 2026-05-23
- [perf] Pre-hydration accent application — won't-fix; the accent switcher itself is dropped from scope (see masterplan §3.1 amendment). — `feature/polish-and-launch` 2026-05-23
- [assets] Cursimax + Flatwhite case screenshots — shipped via headless-Chrome captures of the live sites in `feature/cursimax-and-country-count`. — 2026-05-23
- [assets] Radius case screenshots — shipped using safe deck pages (title + share modal) in `feature/cursimax-and-country-count`. Open entry tracks the "raw UI screenshot" upgrade. — 2026-05-23
- [build] `CaseVisuals` now supports image slots (`src` + `alt`) via `next/image` fill. Adding a case image: drop the file in `/public/work/<slug>/` and pass `src: '/work/<slug>/foo.png'` to the slot. — `feature/cursimax-and-country-count` 2026-05-23
