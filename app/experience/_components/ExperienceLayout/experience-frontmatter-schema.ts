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

export const experienceFrontmatterSchema = z.object({
  slug: z.enum(['client', 'gain-conversion']),
  title: z.string().min(1),
  pageTitle: z.string().min(1),
  pageDescription: z.string().min(1),
  heroLines: z.array(caseHeroLine).min(1).max(4),
  summary: z.string().min(1),
  meta: z.array(caseMetaCell).length(4),
  footerHeading: z.string().min(1),
});

export function validateExperienceFrontmatter(input: unknown) {
  return experienceFrontmatterSchema.parse(input);
}
