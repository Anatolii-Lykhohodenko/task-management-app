import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, { error: 'Name must be at least 1 character' })
    .max(100, { error: 'Name is too long' }),
});

export type CreateProjectSchemaType = z.infer<typeof createProjectSchema>