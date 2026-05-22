export type AboutCardData = {
  label: string;
  lines: readonly string[];
  accentLineIndex?: number;
};

export type BioParagraphSegment =
  | { kind: 'text'; value: string }
  | { kind: 'strong'; value: string }
  | { kind: 'accent'; value: string }
  | { kind: 'em'; value: string };

export type BioParagraph = ReadonlyArray<BioParagraphSegment>;

export type SkillGroupData = {
  name: string;
  tags: readonly string[];
};

export type ResumeCtaData = {
  headingLines: readonly string[];
  accentLineIndex: number;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
};

export type PersonalData = {
  headingLines: readonly string[];
  accentLineIndex: number;
  body: string;
};

export type AboutContent = {
  pageIntro: {
    label: string;
    titleLines: readonly string[];
    accentLineIndex: number;
  };
  bio: {
    portraitAlt: string;
    portraitTag: string;
    cards: readonly AboutCardData[];
    paragraphs: readonly BioParagraph[];
  };
  skills: {
    sectionIndex: string;
    title: string;
    groups: readonly SkillGroupData[];
  };
  experience: {
    sectionIndex: string;
    title: string;
  };
  personal: PersonalData;
  resume: ResumeCtaData;
};
