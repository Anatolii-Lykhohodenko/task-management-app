import prisma from '@/lib/db/client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUserId } from '@/lib/server/auth';
import { getTasks } from '@/lib/db/queries';
import { Priority, Status } from '@prisma/client';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/constants/task';
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

export default async function BoardPage({ params, searchParams }: Props) {
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

const columns = {
  OPEN: tasks.filter((t) => t.status === 'OPEN'),
  DEVELOPING: tasks.filter((t) => t.status === 'DEVELOPING'),
  REVIEW: tasks.filter((t) => t.status === 'REVIEW'),
  CLOSED: tasks.filter((t) => t.status === 'CLOSED'),
};

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

    <div className="overflow-x-auto pb-4">
      <div className="grid min-w-160 grid-cols-4 gap-4">
        {(
          [
            { key: 'OPEN', label: 'Open' },
            { key: 'DEVELOPING', label: 'In Progress' },
            { key: 'REVIEW', label: 'Review' },
            { key: 'CLOSED', label: 'Closed' },
          ] as const
        ).map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <span className="text-xs text-muted-foreground">
                {columns[key].length}
              </span>
            </div>

            <div className="flex flex-col gap-2 rounded-lg bg-muted/40 p-2 min-h-30">
              {columns[key].length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  No tasks
                </p>
              ) : (
                columns[key].map((task) => (
                  <Link
                    key={task.id}
                    href={`/projects/${numericProjectId}/tasks/${task.id}`}
                    className="rounded-md border bg-background px-3 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-muted/60"
                  >
                    {task.title}
                  </Link>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}
