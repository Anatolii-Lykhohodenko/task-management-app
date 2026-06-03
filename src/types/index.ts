import { TASK_PRIORITIES, TASK_STATUSES } from "@/constants/task";

export type ActionState = {
  error?: string;
  success?: boolean;
} | null;

export type Reply = {
  id: number;
  text: string;
  createdAt: Date;
  user: { id: number; name: string };
};

export type Action = (
  _prevState: ActionState | null,
  formData: FormData
) => Promise<ActionState>;

export type SortByType =
  | {
      createdAt: 'asc';
    }
  | { createdAt: 'desc' }
  | { dueDate: 'asc' }
  | { dueDate: 'desc' };

export type Status = (typeof TASK_STATUSES)[number];
export type Priority = (typeof TASK_PRIORITIES)[number];