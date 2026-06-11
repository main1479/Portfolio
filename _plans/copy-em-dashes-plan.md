# Copy pass: remove em-dashes

**What:** A site-wide copy edit. Almost every paragraph on the site uses the em-dash (—) as its connector, which reads as a tic (and as an AI tell). This pass replaces them with plain punctuation: a period, comma, colon, or parentheses, whichever the sentence wants.

**Where it stays:** The dash is kept only where it works as a visual device, not prose punctuation:

- Section index labels ("— Projects", "— FAQ", "— Stack & Skills", "— Experience")
- The trailing lead-in before the big email link ("Let's talk —", "Say hello —", "Or just say hi —")
- The list continuation foot ("— and many, many more.")
- Email sign-off ("— Mainul Islam") and the plain-text "— — —" separators

**Out of scope:** Code comments (not website copy). Year ranges use en-dashes (2022 – Present) and are untouched.

**Files touched:** content files in `app/_lib/`, the five `/work` case studies, the two `/experience` pages, page metadata in `app/layout.tsx` and route pages, OG image text, the contact form error strings, and the confirmation email.

A separate copy-improvement review (no code changes) is reported in the session summary for approval before anything else changes.
