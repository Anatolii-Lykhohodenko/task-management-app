import { TASK_PRIORITIES, TASK_STATUSES } from '@/constants/task';
import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, { error: 'Title must be at least 1 character' })
    .max(100, { error: 'Title is too long' }),
  description: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z
      .string()
      .max(1000, { error: 'Description is too long' })
      .optional()
  ),
  status: z.enum(TASK_STATUSES, { error: 'Invalid status' }),
  priority: z.enum(TASK_PRIORITIES, { error: 'Invalid priority' }),
});


export type TaskSchemaType = z.infer<typeof taskSchema>;
