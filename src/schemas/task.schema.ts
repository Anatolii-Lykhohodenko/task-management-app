import { TASK_PRIORITIES, TASK_STATUSES } from '@/constants/task';
import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, { error: 'Title must be at least 1 character' })
    .max(100, { error: 'Title is too long' }),
  description: z.preprocess((value) => {
    if (!value || value === '') return undefined;
    try {
      return JSON.parse(value as string);
    } catch {
      return undefined;
    }
  }, z.record(z.string(), z.unknown()).optional()),
  status: z.enum(TASK_STATUSES, { error: 'Invalid status' }),
  priority: z.enum(TASK_PRIORITIES, { error: 'Invalid priority' }),
  assigneeId: z
    .string()
    .refine((value) => value === '' || /^\d+$/.test(value), {
      error: 'Invalid assignee',
    }),
  dueDate: z.preprocess((value) => {
    if (!value || value === '') return undefined;
    const date = new Date(value as string);
    return isNaN(date.getTime()) ? undefined : date;
  }, z.date().optional()),
});

export type TaskSchemaType = z.infer<typeof taskSchema>;
