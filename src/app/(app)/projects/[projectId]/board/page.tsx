import prisma from '@/lib/db/client';
import { notFound } from 'next/navigation';
import { getCurrentUserId } from '@/lib/server/auth';
import { getTasks } from '@/lib/db/queries';
import { TASK_PRIORITIES } from '@/constants/task';
import BoardClient from '@/app/(app)/projects/[projectId]/board/BoardClient';
import Link from 'next/link';
import ViewToggle from '@/components/ui/ViewToggle';
import TaskFilters from '@/components/tasks/TaskFilters';
import { SortByParam } from '@/constants';
import { parseSortBy } from '@/helpers';
import type { Priority } from '@/types';

type Props = {
  params: Promise<{
    projectId: string;
  }>;
  searchParams: Promise<{
    search?: string;
    priority?: string;
    sortBy?: SortByParam;
    myTasks?: string;
    overdue?: string;
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

export default async function BoardPage({ params, searchParams }: Props) {
  const ownerId = await getCurrentUserId();
  if (!ownerId) return null;

  const { projectId } = await params;
  const { search, priority, sortBy, myTasks, overdue } =
    await searchParams;
  const validPriority = TASK_PRIORITIES.includes(priority as Priority)
    ? (priority as Priority)
    : null;
  const numericProjectId = Number(projectId);
  const validSortBy = parseSortBy(sortBy);

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
      priority: validPriority,
      sortBy: validSortBy,
      assigneeId: myTasks === 'true' ? ownerId : undefined,
      overdue: overdue === 'true',
    }),
  ]);

  if (!project) notFound();

  const tasks = 'error' in rawTasks ? [] : rawTasks;

  const hasFilters =
    !!search ||
    !!validPriority ||
    myTasks === 'true' ||
    overdue === 'true' ||
    (sortBy ?? 'createdAt_desc') !== 'createdAt_desc';

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
          Board view for {project.name}.
        </p>
      </div>
      <ViewToggle projectId={numericProjectId} />
      <TaskFilters
        search={search ?? ''}
        priority={validPriority}
        sortBy={sortBy ?? 'createdAt_desc'}
        myTasks={myTasks === 'true'}
        overdue={overdue === 'true'}
        skipStatus={true}
      />
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-12 text-center shadow-sm">
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
              : 'You haven’t created any tasks for this project yet. Switch to List view to add your first task.'}
          </p>
          {hasFilters && (
            <div className="mt-6">
              <Link
                href={`/projects/${numericProjectId}/board`}
                className="inline-flex h-9 items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Clear all filters
              </Link>
            </div>
          )}
        </div>
      ) : (
        <BoardClient
          key={`${search ?? ''}-${validPriority ?? ''}-${validSortBy}-${myTasks}-${overdue}`}
          projectId={numericProjectId}
          initialTasks={tasks}
        />
      )}
    </div>
  );
}
