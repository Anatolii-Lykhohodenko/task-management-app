'use client';

import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Priority, Status } from '@prisma/client';
import { TaskProperties } from '@/components/ui/TaskPropeties';

type Props = {
  task: {
    id: number;
    title: string;
    status: Status;
    priority: Priority;
  };
  projectId: number;
};

export default function TaskCard({ task, projectId }: Props) {
  return (
    <Card className="transition-colors hover:bg-muted/40">
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <Link
          href={`/projects/${projectId}/tasks/${task.id}`}
          className="min-w-0 text-sm font-medium hover:underline"
        >
          <span className="block truncate">{task.title}</span>
        </Link>
        <TaskProperties task={task} projectId={projectId} />
      </CardContent>
    </Card>
  );
}
