'use client';

import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { TaskProperties } from '@/components/ui/TaskPropeties';
import { DueDateBadge } from '@/components/ui/DueDataBadge';
import type { Priority, Status } from '@/types';

type Props = {
  task: {
    id: number;
    title: string;
    status: Status;
    priority: Priority;
    dueDate: Date | null;
    assignee: { name: string } | null;
  };
  projectId: number;
};

export default function TaskCard({ task, projectId }: Props) {
  return (
    <Card className="group border-border/50 shadow-none transition-all hover:border-border hover:shadow-sm">
      <CardContent className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <Link
            href={`/projects/${projectId}/tasks/${task.id}`}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            <span className="block truncate">{task.title}</span>
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {task.assignee ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-[9px] font-semibold text-primary uppercase">
                  {task.assignee.name[0]}
                </span>
                {task.assignee.name}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground/50">
                Unassigned
              </span>
            )}
            {task.dueDate && (
              <>
                <span className="text-muted-foreground/30 text-xs">·</span>
                <DueDateBadge dueDate={task.dueDate} />
              </>
            )}
          </div>
        </div>
        <TaskProperties task={task} projectId={projectId} />
      </CardContent>
    </Card>
  );
}
