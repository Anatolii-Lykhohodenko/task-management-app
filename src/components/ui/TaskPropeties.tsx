'use client';

import { updateTaskPartially } from '@/server/actions/tasks';
import { Priority, Status } from '@prisma/client';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/constants/task';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  task: {
    id: number;
    title: string;
    status: Status;
    priority: Priority;
  };
  projectId: number;
};

export function TaskProperties({ task, projectId }: Props) {
  return (
    <div className="flex shrink-0 items-center gap-2">
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
        <SelectTrigger className="h-7 w-30 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4}>
          {TASK_STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="text-xs">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
        <SelectTrigger className="h-7 w-30 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4}>
          {TASK_PRIORITIES.map((p) => (
            <SelectItem key={p} value={p} className="text-xs">
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
