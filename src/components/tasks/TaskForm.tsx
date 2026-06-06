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
import { cn } from '@/lib/utils';

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
    assignee: { id: number; name: string } | null;
  };
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-blue-500/10 text-blue-500 border-blue-500/25',
  DEVELOPING: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
  REVIEW: 'bg-violet-500/10 text-violet-500 border-violet-500/25',
  CLOSED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25',
};
const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Open',
  DEVELOPING: 'In Progress',
  REVIEW: 'Review',
  CLOSED: 'Closed',
};

const PRIORITY_STYLES: Record<string, string> = {
  LOW: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  MEDIUM: 'bg-orange-500/10 text-orange-500 border-orange-500/25',
  HIGH: 'bg-red-500/10 text-red-500 border-red-500/25',
  CRITICAL: 'bg-red-900/20 text-red-400 border-red-500/30',
};
const PRIORITY_LABEL: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
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
  const [status, setStatus] = useState<string>(defaultValues?.status ?? 'OPEN');
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
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-sm">
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

      {/* Status + Priority */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="status" className="text-sm">
            Status <RequiredMark />
          </Label>
          <Select onValueChange={setStatus} defaultValue={status}>
            <SelectTrigger
              id="status"
              className={cn(
                'w-full border text-xs font-medium',
                STATUS_STYLES[status]
              )}
            >
              <SelectValue>{STATUS_LABEL[status]}</SelectValue>
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              align="start"
              sideOffset={4}
            >
              {TASK_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 font-medium border',
                      STATUS_STYLES[s]
                    )}
                  >
                    {STATUS_LABEL[s]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="status" value={status} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="priority" className="text-sm">
            Priority <RequiredMark />
          </Label>
          <Select onValueChange={setPriority} defaultValue={priority}>
            <SelectTrigger
              id="priority"
              className={cn(
                'w-full border text-xs font-medium',
                PRIORITY_STYLES[priority]
              )}
            >
              <SelectValue>{PRIORITY_LABEL[priority]}</SelectValue>
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              align="start"
              sideOffset={4}
            >
              {TASK_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p} className="text-xs">
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 font-medium border',
                      PRIORITY_STYLES[p]
                    )}
                  >
                    {PRIORITY_LABEL[p]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="priority" value={priority} />
        </div>
      </div>

      {/* Assignee */}
      <div className="space-y-1.5">
        <Label htmlFor="assignee" className="text-sm">
          Assignee
        </Label>
        <Select onValueChange={setAssigneeId} defaultValue={assigneeId}>
          <SelectTrigger id="assignee" className="w-full">
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            align="start"
            sideOffset={4}
          >
            <SelectItem value="unassigned">
              <span className="text-muted-foreground">Unassigned</span>
            </SelectItem>
            {assignees.map((a) => (
              <SelectItem key={a.id} value={String(a.id)}>
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold uppercase text-primary">
                    {a.name[0]}
                  </span>
                  {a.name}
                </span>
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

      {/* Due date */}
      <div className="space-y-1.5">
        <Label htmlFor="dueDate" className="text-sm">
          Due date
        </Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-sm">Description</Label>
        <RichTextEditor
          name="description"
          defaultValue={defaultValues?.description ?? null}
        />
      </div>

      <input type="hidden" name="projectId" value={projectId} />
      {taskId && <input type="hidden" name="taskId" value={taskId} />}

      {/* Footer */}
      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          <span className="text-destructive">*</span> Required fields
        </p>
        <Button type="submit" disabled={isPending} size="sm">
          {isPending
            ? 'Saving…'
            : defaultValues
              ? 'Save changes'
              : 'Create task'}
        </Button>
      </div>

      {state?.error && (
        <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
