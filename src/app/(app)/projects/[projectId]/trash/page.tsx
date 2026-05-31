import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserId } from '@/lib/server/auth';
import { findAllDeletedTasks } from '@/lib/db/queries';
import { restoreTask, hardDeleteTask } from '@/server/actions/tasks';
import { TrashList } from '@/components/trash/TrashList';

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function TrashPage({ params }: Props) {
  const { projectId } = await params;
  const numericProjectId = Number(projectId);

  const userId = await getCurrentUserId();
  if (!userId) return null;

  if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
    notFound();
  }

  const result = await findAllDeletedTasks({ projectId: numericProjectId });

  const tasks = 'error' in result ? [] : result;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${projectId}/tasks`}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to tasks
        </Link>
      </div>

      <div className="border-b pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Project
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Trash</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Deleted tasks for this project. Restore any task to bring it back.
        </p>
      </div>

      <TrashList
        tasks={tasks}
        projectId={numericProjectId}
        restoreAction={restoreTask}
        deleteAction={hardDeleteTask}
      />
    </div>
  );
}
