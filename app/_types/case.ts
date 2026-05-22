export type CaseAccent = 'plain' | 'accent' | 'outline';

export type CaseHeroLine = {
  text: string;
  /** `plain` (default), `accent` (var(--accent) ink), or `outline` (`-webkit-text-stroke`). */
  style: CaseAccent;
  /** If true, append an accent-coloured `.` after the line. */
  trailingAccentDot?: boolean;
};

export type CaseMetaCell = {
  label: string;
  /** Display value; line breaks allowed via `\n` (rendered as `<br/>`). */
  value: string;
  /** Show an accent pulsing dot before the value. Used for the In-progress cell. */
  accentDot?: boolean;
};

export type NextCasePointer = {
  /** Small label above the title, eg "Next case · 02" or "Back to · 01". */
  label: string;
  /** Display title of the next case. */
  title: string;
  /** Slug of the next case (CaseLayout resolves the href as `/work/${slug}`). */
  slug: string;
};

export type CaseFrontmatter = {
  slug: string;
  num: string;
  title: string;
  pageTitle: string;
  pageDescription: string;
  heroLines: readonly CaseHeroLine[];
  summary: string;
  meta: readonly CaseMetaCell[];
  next: NextCasePointer;
  footerHeading: string;
};

export type CodeMockLineType = 'comment' | 'prompt' | 'response' | 'empty';

export type CodeMockToken =
  | { kind: 'text'; value: string }
  | { kind: 'comment'; value: string }
  | { kind: 'prompt'; value: string }
  | { kind: 'keyword'; value: string }
  | { kind: 'value'; value: string }
  | { kind: 'string'; value: string }
  | { kind: 'accent'; value: string };

export type CodeMockLine = {
  type: CodeMockLineType;
  tokens?: readonly CodeMockToken[];
};

export type CountryCell = {
  /** Two-letter label (UK / IN / SK / AT / AU / CA). */
  flag: string;
  /** Full country name. */
  name: string;
};
