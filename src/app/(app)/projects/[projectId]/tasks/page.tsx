import { TaskForm } from '@/components/tasks/TaskForm';
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
import { notFound } from 'next/navigation';
import { getCurrentUserId } from '@/lib/server/auth';
import { getTasks } from '@/lib/db/queries';
import { Priority, Status } from '@prisma/client';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/constants/task';
import TaskFilters from '@/components/tasks/TaskFilters';

type Props = {
  params: Promise<{
    projectId: string;
  }>;
  searchParams: Promise<{
    search?: string;
    status?: string;
    priority?: string;
    sortBy?: 'asc' | 'desc';
  }>;
};

export default async function TasksPage({ params, searchParams }: Props) {
  const ownerId = await getCurrentUserId();
  if (!ownerId) return null;

  const { projectId } = await params;
  const { search, status, priority, sortBy } = await searchParams;
  const validStatus = TASK_STATUSES.includes(status as Status)
    ? (status as Status)
    : null;
  const validPriority = TASK_PRIORITIES.includes(priority as Priority)
    ? (priority as Priority)
    : null;
  const numericProjectId = Number(projectId);
  const validSortBy = ['asc', 'desc'].includes(sortBy as 'asc' | 'desc')
    ? (sortBy as 'asc' | 'desc')
    : 'desc';

  if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
    notFound();
  }

  const [project, rawTasks] = await Promise.all([
    prisma.project.findUnique({
      where: {
        id: numericProjectId,
        ownerId,
      },
      select: {
        name: true,
        id: true,
      },
    }),
    getTasks({
      projectId: numericProjectId,
      search: search || null,
      status: validStatus,
      priority: validPriority,
      sortBy: validSortBy,
    }),
  ]);

  if (!project) notFound();

  const tasks = 'error' in rawTasks ? [] : rawTasks;

  return (
    <div className="space-y-6">
      <Link
        href={`/projects/${project.id}`}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to {project.name}
      </Link>
      <div className="border-b pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Tasks
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Tasks for {project.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse and create tasks for {project.name}.
        </p>
      </div>

      <TaskFilters
        search={search ?? ''}
        status={validStatus}
        priority={validPriority}
        sortBy={validSortBy}
      />

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
            <TaskForm projectId={numericProjectId} serverAction={createTask} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
