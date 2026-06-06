'use client';

import { updateTaskPartially } from '@/server/actions/tasks';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/constants/task';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Priority, Status } from '@/types';

type Props = {
  task: {
    id: number;
    title: string;
    status: Status;
    priority: Priority;
  };
  projectId: number;
  skipStatus?: boolean;
};

const STATUS_STYLES: Record<Status, string> = {
  OPEN: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/15',
  DEVELOPING:
    'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/15',
  REVIEW:
    'bg-violet-500/10 text-violet-500 border-violet-500/20 hover:bg-violet-500/15',
  CLOSED:
    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/15',
};

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: 'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/15',
  MEDIUM:
    'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/15',
  HIGH: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/15',
  CRITICAL: 'bg-red-900/20 text-red-400 border-red-500/25 hover:bg-red-900/25',
};

const STATUS_LABEL: Record<Status, string> = {
  OPEN: 'Open',
  DEVELOPING: 'In Progress',
  REVIEW: 'Review',
  CLOSED: 'Closed',
};

const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export function TaskProperties({ task, projectId, skipStatus = false }: Props) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {!skipStatus && (
        <Select
          defaultValue={task.status}
          onValueChange={(value) =>
            updateTaskPartially({
              taskId: task.id,
              projectId,
              status: value as Status,
            })
          }
        >
          <SelectTrigger
            className={cn(
              'h-6 w-auto cursor-pointer gap-1 border px-2 text-[11px] font-semibold uppercase tracking-wide shadow-none transition-colors focus:ring-0 focus:ring-offset-0',
              STATUS_STYLES[task.status]
            )}
          >
            <SelectValue>{STATUS_LABEL[task.status]}</SelectValue>
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
                    'rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    STATUS_STYLES[s as Status]
                  )}
                >
                  {STATUS_LABEL[s as Status]}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        defaultValue={task.priority}
        onValueChange={(value) =>
          updateTaskPartially({
            taskId: task.id,
            projectId,
            priority: value as Priority,
          })
        }
      >
        <SelectTrigger
          className={cn(
            'h-6 w-auto cursor-pointer gap-1 border px-2 text-[11px] font-semibold uppercase tracking-wide shadow-none transition-colors focus:ring-0 focus:ring-offset-0',
            PRIORITY_STYLES[task.priority]
          )}
        >
          <SelectValue>{PRIORITY_LABEL[task.priority]}</SelectValue>
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
                  'rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  PRIORITY_STYLES[p as Priority]
                )}
              >
                {PRIORITY_LABEL[p as Priority]}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
