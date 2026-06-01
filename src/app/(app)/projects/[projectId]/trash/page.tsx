import { notFound } from 'next/navigation';
import { getCurrentUserId } from '@/lib/server/auth';
import { findAllDeletedTasks } from '@/lib/db/queries';
import { restoreTask, hardDeleteTask } from '@/server/actions/tasks';
import TrashComponent from '@/components/trash/TrashComponent';

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{
    highlight?: string;
    search?: string;
  }>;
};

export default async function TrashPage({ params, searchParams }: Props) {
  const { projectId } = await params;
  const numericProjectId = Number(projectId);

  const userId = await getCurrentUserId();
  if (!userId) return null;

  if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
    notFound();
  }

  const { highlight, search } = await searchParams;
  const numericHighlight = Number(highlight) > 0 ? Number(highlight) : null;

  const result = await findAllDeletedTasks({
    projectId: numericProjectId,
    ...(search && { search }),
  });

  const tasks = 'error' in result ? [] : result;

  return (
    <TrashComponent
      search={search || ''}
      projectId={numericProjectId}
      tasks={tasks}
      restoreAction={restoreTask}
      deleteAction={hardDeleteTask}
      highlight={numericHighlight}
    />
  );
}
