import type { NextCasePointer } from '../_types/case';

/** Slug → next case pointer for the bottom pager. The wrap entry uses `Back to · 01`. */
const NEXT_CASE: Record<string, NextCasePointer> = {
  avsb: { label: 'Next case · 02', title: 'Kemon Doctor', slug: 'kemon-doctor' },
  'kemon-doctor': { label: 'Next case · 03', title: 'Radius', slug: 'radius' },
  radius: { label: 'Next case · 04', title: 'Client Work', slug: 'client' },
  client: { label: 'Next case · 05', title: 'Cursimax', slug: 'cursimax' },
  cursimax: { label: 'Next case · 06', title: 'Flatwhite', slug: 'flatwhite' },
  flatwhite: { label: 'Back to · 01', title: 'AvsB', slug: 'avsb' },
};

export function getNextCase(currentSlug: string): NextCasePointer {
  const next = NEXT_CASE[currentSlug];
  if (!next) throw new Error(`No next-case pointer registered for slug: ${currentSlug}`);
  return next;
}
