'use client';

import { useActionState, useState } from 'react';
import type { Action, Status, Priority } from '@/types';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Button } from '@/components/ui/button';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/constants/task';

type Props = {
  serverAction: Action;
  projectId: number;
  taskId?: number;
  assignees?: { name: string; id: number }[];
  defaultValues?: {
    title: string;
    status: Status;
    priority: Priority;
    description?: unknown;
    dueDate?: Date | null;
    assignee: {
      id: number;
      name: string;
    } | null;
  };
};

function RequiredMark() {
  return (
    <span className="ml-0.5 text-destructive" aria-hidden="true">
      *
    </span>
  );
}

export function TaskForm({
  serverAction,
  projectId,
  taskId,
  assignees = [],
  defaultValues,
}: Props) {
  const [state, action, isPending] = useActionState(serverAction, null);
  const [status, setStatus] = useState<string>(
    defaultValues?.status ?? 'OPEN'
  );
  const [priority, setPriority] = useState<string>(
    defaultValues?.priority ?? 'MEDIUM'
  );
  const [assigneeId, setAssigneeId] = useState<string>(
    defaultValues?.assignee?.id
      ? String(defaultValues.assignee.id)
      : 'unassigned'
  );
  const [dueDate, setDueDate] = useState<string>(
    defaultValues?.dueDate
      ? new Date(defaultValues.dueDate).toISOString().split('T')[0]
      : ''
  );

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Title <RequiredMark />
        </Label>
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
          <Label htmlFor="status">
            Status <RequiredMark />
          </Label>
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
              {TASK_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="status" value={status} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="priority">
            Priority <RequiredMark />
          </Label>
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
              {TASK_PRIORITIES.map((p) => (
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
        <Label htmlFor="dueDate">Due date</Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <RichTextEditor
          name="description"
          defaultValue={defaultValues?.description ?? null}
        />
      </div>

      <input type="hidden" name="projectId" value={projectId} />
      {taskId && <input type="hidden" name="taskId" value={taskId} />}

      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          <span className="text-destructive">*</span> Required fields
        </p>
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
