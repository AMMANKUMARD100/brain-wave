import { z } from 'zod';

export const AskSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, 'Question is required')
    .max(2000, 'Question must be 2000 characters or fewer'),
});

export type AskRequest = z.infer<typeof AskSchema>;
