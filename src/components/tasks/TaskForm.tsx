'use client';

import { useActionState, useState } from 'react';
import { Status, Priority } from '@prisma/client';
import { ActionState } from '@/types';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const statuses = Object.values(Status);
const priorities = Object.values(Priority);

type Props = {
  serverAction: (
    prevState: ActionState,
    formData: FormData
  ) => Promise<ActionState>;
  projectId: string;
  taskId?: string;
  defaultValues?: {
    title: string;
    status: Status;
    priority: Priority;
    description?: string | null;
  };
};

export default function TaskForm({
  serverAction,
  projectId,
  taskId,
  defaultValues,
}: Props) {
  const [state, action, isPending] = useActionState(serverAction, null);
  const [status, setStatus] = useState<string>(
    defaultValues?.status ?? Status.OPEN
  );
  const [priority, setPriority] = useState<string>(
    defaultValues?.priority ?? Priority.MEDIUM
  );

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          type="text"
          defaultValue={defaultValues?.title ?? ''}
          placeholder="Enter task title"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select onValueChange={setStatus} defaultValue={status}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="status" value={status} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="priority">Priority</Label>
          <Select onValueChange={setPriority} defaultValue={priority}>
            <SelectTrigger id="priority" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="priority" value={priority} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description ?? ''}
          placeholder="Add more context for this task"
          className="min-h-32"
        />
      </div>

      <input type="hidden" name="projectId" value={projectId} />
      {taskId && <input type="hidden" name="taskId" value={taskId} />}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? 'Saving...'
            : defaultValues
              ? 'Save changes'
              : 'Create task'}
        </Button>
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
