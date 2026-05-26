import type { EndCTAContent } from '../_components/EndCTA/EndCTA';
import type { CaseHeroLine, CaseMetaCell } from './case';

export type ExperienceFrontmatter = {
  slug: 'client' | 'gain-conversion';
  title: string;
  pageTitle: string;
  pageDescription: string;
  heroLines: readonly CaseHeroLine[];
  summary: string;
  meta: readonly CaseMetaCell[];
  endCta: EndCTAContent;
  footerHeading: string;
};
