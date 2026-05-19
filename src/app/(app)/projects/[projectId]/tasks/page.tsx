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
import { notFound } from 'next/navigation';
import { getCurrentUserId } from '@/lib/server/auth';
import { getAssignees, getTasks } from '@/lib/db/queries';
import { Priority, Status } from '@prisma/client';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/constants/task';
import TaskFilters from '@/components/tasks/TaskFilters';
import TaskCard from '@/components/ui/TaskCard';
import ViewToggle from '@/components/ui/ViewToggle';

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const ownerId = await getCurrentUserId();

  if (!ownerId) return { title: 'Tasks' };

  const project = await prisma.project.findUnique({
    where: { id: Number(projectId), ownerId },
    select: { name: true },
  });

  return { title: project?.name ?? 'Tasks' };
}

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

  const [project, rawTasks, assignees] = await Promise.all([
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
    getAssignees({
      projectId: numericProjectId
    })
  ]);

  if (!project) notFound();

  const tasks = 'error' in rawTasks ? [] : rawTasks;
  const hasFilters = !!search || !!validStatus || !!validPriority;

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

      <ViewToggle projectId={numericProjectId} />

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
            <Card className="flex flex-col items-center justify-center border-dashed py-12 text-center shadow-none">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                {hasFilters ? (
                  <svg
                    className="h-6 w-6 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-medium text-foreground">
                {hasFilters ? 'No tasks found' : 'No tasks yet'}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {hasFilters
                  ? "We couldn't find any tasks matching your current filters. Try adjusting them or clear the filters to see all tasks."
                  : 'You haven’t created any tasks for this project yet. Use the form on the right to add your first task.'}
              </p>
              {hasFilters && (
                <div className="mt-6">
                  <Link
                    href={`/projects/${numericProjectId}/tasks`}
                    className="inline-flex h-9 items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    Clear all filters
                  </Link>
                </div>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  task={task}
                  projectId={numericProjectId}
                  key={task.id}
                />
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
            <TaskForm
              projectId={numericProjectId}
              serverAction={createTask}
              assignees={assignees}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
