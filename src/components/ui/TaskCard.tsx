'use client';

import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Priority, Status } from '@prisma/client';
import { TaskProperties } from '@/components/ui/TaskPropeties';
import { DueDateBadge } from '@/components/ui/DueDataBadge';

type Props = {
  task: {
    id: number;
    title: string;
    status: Status;
    priority: Priority;
    dueDate: Date | null;
    assignee: {
      name: string;
    } | null;
  };
  projectId: number;
};

export default function TaskCard({ task, projectId }: Props) {
  return (
    <Card className="transition-colors hover:bg-muted/40">
      <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <Link
            href={`/projects/${projectId}/tasks/${task.id}`}
            className="text-sm font-medium hover:underline"
          >
            <span className="block truncate">{task.title}</span>
          </Link>
          <div className="mt-0.5 flex items-center gap-2">
            <p className="truncate text-xs text-muted-foreground">
              {task.assignee?.name ?? 'Unassigned'}
            </p>
          </div>
          {task.dueDate && (
            <div className="mt-0.5">
              <DueDateBadge dueDate={task.dueDate} />
            </div>
          )}
        </div>
        <TaskProperties task={task} projectId={projectId} />
      </CardContent>
    </Card>
  );
}
