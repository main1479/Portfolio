export type WorkCategory = 'product' | 'experimentation' | 'client';

export type WorkProject = {
  slug: string;
  num: string;
  title: string;
  /** Long, voice-y summary — used on the home SelectedWork row. */
  summary: string;
  /** Short, punchy meta sentence — used on the /work index row. */
  metaShort: string;
  tags: readonly string[];
  /** Categories the project belongs to; drives the index filter chips. */
  categories: readonly WorkCategory[];
  /** Featured on the home page's SelectedWork section. */
  featured: boolean;
  order: number;
  year?: string;
  type?: 'own' | 'client' | 'agency';
  /** Year + status sentence as shown on the /work index row's year/status column. */
  yearStatus?: string;
  /** True if the project has its own /work/<slug> case page. False = stub row that links to a shared case page. */
  hasCase: boolean;
  /** Target href for the index row. If hasCase, this is `/work/${slug}`; if stub, the page it falls through to. */
  href: string;
};
