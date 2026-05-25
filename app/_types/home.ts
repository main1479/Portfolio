export type Variant = 'A' | 'B';

export type IntroSegment =
  | { kind: 'text'; value: string }
  | { kind: 'strong'; value: string }
  | { kind: 'accent'; value: string };

export type StatItem = {
  value: number;
  suffix?: string;
  label: string;
};

export type ServiceItem = {
  num: string;
  titleLines: readonly [string, string];
  desc: string;
  tags: readonly string[];
};

export type ClientItem = {
  sector: string;
  /** Rendered with <wbr/> joining the parts — supports soft-break for long brand names. */
  nameParts: readonly string[];
};

export type RecognitionItem = {
  sealText: string;
  titleLines: readonly [string, string];
  source: string;
  date: string;
  href: string;
};

export type XpItem = {
  year: string;
  roleLines: readonly string[];
  at?: string;
  desc: string;
  loc: string;
};

export type HomeContent = {
  hero: {
    topbarLeft: { name: string; role: string };
    topbarRight: { version: string; year: string; metric: string };
    sub: string;
    statusLine: string;
    ctaLabel: string;
    ctaHref: string;
  };
  marquee: {
    tokens: ReadonlyArray<{ label: string; accent?: boolean }>;
  };
  stats: readonly StatItem[];
  services: { sectionIndex: string; items: readonly ServiceItem[] };
  selectedWork: {
    sectionIndex: string;
    indexLink: { href: string; label: string };
  };
  selectedClients: {
    sectionIndex: string;
    intro: ReadonlyArray<IntroSegment>;
    items: readonly ClientItem[];
    foot: string;
  };
  recognition: {
    sectionIndex: string;
    lede: ReadonlyArray<IntroSegment>;
    items: readonly RecognitionItem[];
  };
  experience: {
    sectionIndex: string;
    items: readonly XpItem[];
  };
  endCta: {
    headingLines: ReadonlyArray<{ text: string; variant?: 'outline' }>;
    sub: string;
    ctaLabel: string;
    ctaHref: string;
  };
};
