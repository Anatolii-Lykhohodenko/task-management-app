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
import { TASK_PRIORITIES, TASK_STATUSES } from '@/constants/task';
import TaskFilters from '@/components/tasks/TaskFilters';
import TaskCard from '@/components/ui/TaskCard';
import ViewToggle from '@/components/ui/ViewToggle';
import { parseSortBy } from '@/helpers';
import { SortByParam } from '@/constants';
import { ToastHandler } from '@/components/ui/ToastHandler';
import { Search, FilePlus } from 'lucide-react';
import type { Priority, Status } from '@/types';

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{
    search?: string;
    status?: string;
    priority?: string;
    sortBy?: SortByParam;
    myTasks?: string;
    overdue?: string;
    toast?: string;
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
  const { search, status, priority, sortBy, myTasks, overdue, toast } =
    await searchParams;

  const validStatus = TASK_STATUSES.includes(status as Status)
    ? (status as Status)
    : null;
  const validPriority = TASK_PRIORITIES.includes(priority as Priority)
    ? (priority as Priority)
    : null;
  const numericProjectId = Number(projectId);
  const validSortBy = parseSortBy(sortBy);

  if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) notFound();

  const [project, rawTasks, assignees] = await Promise.all([
    prisma.project.findUnique({
      where: { id: numericProjectId, ownerId },
      select: { name: true, id: true },
    }),
    getTasks({
      projectId: numericProjectId,
      search: search || null,
      status: validStatus,
      priority: validPriority,
      sortBy: validSortBy,
      assigneeId: myTasks === 'true' ? ownerId : undefined,
      overdue: overdue === 'true',
    }),
    getAssignees({ projectId: numericProjectId }),
  ]);

  if (!project) notFound();

  const tasks = 'error' in rawTasks ? [] : rawTasks;
  const hasFilters =
    !!search ||
    !!validStatus ||
    !!validPriority ||
    myTasks === 'true' ||
    overdue === 'true' ||
    (sortBy ?? 'createdAt_desc') !== 'createdAt_desc';

  return (
    <div className="space-y-5">
      <ToastHandler message={toast} />

      <Link
        href={`/projects/${project.id}`}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← {project.name}
      </Link>

      {/* Page header */}
      <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Tasks
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {project.name}
          </h1>
        </div>
        <ViewToggle projectId={numericProjectId} />
      </div>

      {/* Filters */}
      <TaskFilters
        search={search ?? ''}
        status={validStatus}
        priority={validPriority}
        myTasks={myTasks === 'true'}
        overdue={overdue === 'true'}
        sortBy={sortBy ?? 'createdAt_desc'}
      />

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Task list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Task list
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>

          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                {hasFilters ? (
                  <Search className="h-4.5 w-4.5" />
                ) : (
                  <FilePlus className="h-4.5 w-4.5" />
                )}
              </div>
              <p className="text-sm font-medium">
                {hasFilters ? 'No tasks found' : 'No tasks yet'}
              </p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                {hasFilters
                  ? 'Try adjusting your filters.'
                  : 'Use the form on the right to add your first task.'}
              </p>
              {hasFilters && (
                <Link
                  href={`/projects/${numericProjectId}/tasks`}
                  className="mt-4 text-xs font-medium text-primary hover:underline"
                >
                  Clear all filters
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map(
                (task: {
                  id: number;
                  title: string;
                  status: Status;
                  priority: Priority;
                  dueDate: Date | null;
                  assignee: { name: string } | null;
                }) => (
                  <TaskCard
                    task={task}
                    projectId={numericProjectId}
                    key={task.id}
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* Create task card */}
        <Card className="h-fit shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Create task</CardTitle>
            <CardDescription className="text-xs">
              Add a new task to this project.
            </CardDescription>
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
