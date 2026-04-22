import TaskForm from '@/components/tasks/TaskForm';
import prisma from '@/lib/db/client';
import { createTask } from '@/server/actions/tasks';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function TasksPage({ params }: Props) {
  const { projectId } = await params;

  const tasks = await prisma.task.findMany({
    where: {
      projectId: +projectId,
    },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Tasks
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          All tasks
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse and create tasks for this project.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Task list
            </h2>
            <p className="text-sm text-muted-foreground">
              {tasks.length} total
            </p>
          </div>

          {tasks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center py-10">
                <p className="text-sm text-muted-foreground">No tasks yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  className="transition-colors hover:bg-muted/40"
                >
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <Link
                      href={`/projects/${projectId}/tasks/${task.id}`}
                      className="min-w-0 text-sm font-medium hover:underline"
                    >
                      <span className="block truncate">{task.title}</span>
                    </Link>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="secondary">{task.status}</Badge>
                      <Badge variant="outline">{task.priority}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Create task</CardTitle>
            <CardDescription>Add a new task to this project.</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskForm projectId={projectId} serverAction={createTask} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
