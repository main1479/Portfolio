import { z } from 'zod';

const caseHeroLine = z.object({
  text: z.string().min(1),
  style: z.enum(['plain', 'accent', 'outline']),
  trailingAccentDot: z.boolean().optional(),
});

const caseMetaCell = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  accentDot: z.boolean().optional(),
});

const nextCasePointer = z.object({
  label: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
});

export const caseFrontmatterSchema = z.object({
  slug: z.string().min(1),
  num: z.string().regex(/^\d{2}$/, 'num must be a 2-digit string like "01"'),
  title: z.string().min(1),
  pageTitle: z.string().min(1),
  pageDescription: z.string().min(1),
  heroLines: z.array(caseHeroLine).min(1).max(4),
  summary: z.string().min(1),
  meta: z.array(caseMetaCell).length(4),
  next: nextCasePointer,
  footerHeading: z.string().min(1),
});

/** Validates frontmatter at module-load time; throws on any author error. */
export function validateFrontmatter(input: unknown) {
  return caseFrontmatterSchema.parse(input);
}
