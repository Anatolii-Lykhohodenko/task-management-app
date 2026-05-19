'use client';

import { useActionState, useState } from 'react';
import { Status, Priority } from '@prisma/client';
import { Action } from '@/types';
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
  serverAction: Action;
  projectId: number;
  taskId?: number;
  assignees?: { name: string; id: number }[];
  defaultValues?: {
    title: string;
    status: Status;
    priority: Priority;
    description?: string | null;
    assignee: {
      id: number;
      name: string;
    } | null;
  };
};

export function TaskForm({
  serverAction,
  projectId,
  taskId,
  assignees = [],
  defaultValues,
}: Props) {
  const [state, action, isPending] = useActionState(serverAction, null);
  const [status, setStatus] = useState<string>(
    defaultValues?.status ?? Status.OPEN
  );
  const [priority, setPriority] = useState<string>(
    defaultValues?.priority ?? Priority.MEDIUM
  );
  const [assigneeId, setAssigneeId] = useState<string>(
    defaultValues?.assignee?.id
      ? String(defaultValues.assignee.id)
      : 'unassigned'
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
            <SelectContent
              position="popper"
              side="bottom"
              align="start"
              sideOffset={4}
            >
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
            <SelectContent
              position="popper"
              side="bottom"
              align="start"
              sideOffset={4}
            >
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
        <Label htmlFor="assignee">Assignee</Label>
        <Select onValueChange={setAssigneeId} defaultValue={assigneeId}>
          <SelectTrigger id="assignee" className="w-full">
            <SelectValue placeholder="Select assignee" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            align="start"
            sideOffset={4}
          >
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {assignees.map((assignee) => (
              <SelectItem key={assignee.id} value={String(assignee.id)}>
                {assignee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          type="hidden"
          name="assigneeId"
          value={assigneeId === 'unassigned' ? '' : assigneeId}
        />
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
