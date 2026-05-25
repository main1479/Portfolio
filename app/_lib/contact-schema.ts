import { z } from 'zod';

export const TOPIC_VALUES = [
  'full-time-role',
  'contract-freelance',
  'a-b-testing',
  'frontend-build',
  'something-else',
] as const;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter your name (at least 2 characters).')
    .max(80, 'Name is too long.'),
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address.')
    .email('Enter a valid email address.')
    .max(160, 'Email is too long.'),
  topic: z.enum(TOPIC_VALUES, { error: 'Pick a topic — what is this about?' }),
  message: z
    .string()
    .trim()
    .min(20, 'Add a short note (at least 20 characters).')
    .max(4000, 'Message is too long — keep it under 4000 characters.'),
  company: z.string().max(0, 'Spam check failed.').optional().default(''),
});

export type ContactInput = z.infer<typeof contactSchema>;
