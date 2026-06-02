'use client';

import { Priority, Status } from '@prisma/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogYesOrNo } from '@/components/ui/DialogYesOrNo';

type Task = {
  id: number;
  title: string;
  status: Status;
  priority: Priority;
  deletedAt: Date | null;
  assignee: { name: string } | null;
  logs: { user: { name: string } | null }[];
};

type Props = {
  tasks: Task[];
  projectId: number;
  highlight?: number | null;
  restoreAction: (params: {
    projectId: number;
    taskId: number;
  }) => Promise<
    | { success: boolean; error: string }
    | { success: boolean; error?: undefined }
  >;
  deleteAction: ({
    projectId,
    taskId,
  }: {
    projectId: number;
    taskId: number;
  }) => Promise<
    | {
        success: boolean;
        error: string;
      }
    | {
        success: boolean;
        error?: undefined;
      }
  >;
};

export function TrashList({
  tasks,
  projectId,
  restoreAction,
  deleteAction,
  highlight,
}: Props) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const highlightRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (highlight && highlightRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [highlight]);

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No deleted tasks. Everything is in order.
      </p>
    );
  }

  const handleRestore = async (taskId: number) => {
    setLoadingId(taskId);
    try {
      const result = await restoreAction({ projectId, taskId });
      if (!result.success) {
        toast.error(result.error ?? 'Something went wrong');
        return;
      }
      toast.success('✓ Task restored');
      router.refresh();
    } catch {
      toast.error('Failed to restore task');
    } finally {
      setLoadingId(null);
    }
  };
  const handleHardDelete = async (taskId: number) => {
    setDeletingId(taskId);
    try {
      const result = await deleteAction({ projectId, taskId });
      if (!result.success) {
        toast.error(result.error ?? 'Something went wrong');
        return;
      }
      toast.success('✓ Task deleted');
      router.refresh();
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ul className="space-y-2">
      {tasks.map((task) => {
        const diffDays = task.deletedAt
          ? Math.round((+new Date() - +task.deletedAt) / (1000 * 60 * 60 * 24))
          : null;

        const ago = diffDays === 1 ? 'day ago' : 'days ago';

        const diff =
          diffDays === null
            ? null
            : diffDays === 0
              ? 'today'
              : `${diffDays} ${ago}`;

        return (
          <li
            key={task.id}
            ref={task.id === highlight ? highlightRef : null}
            className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
              task.id === highlight
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card'
            }`}
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">{task.title}</p>
              <p className="text-xs text-muted-foreground">
                {task.status} · {task.priority}
                {task.assignee && ` · ${task.assignee.name}`}
              </p>
              <p className="text-xs text-muted-foreground">
                Deleted by {task.logs[0]?.user?.name ?? 'Unknown'} ·{' '}
                {task.deletedAt
                  ? new Date(task.deletedAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
                {'  '}
                {diff && diff}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                disabled={deletingId === task.id || loadingId === task.id}
                onClick={() => handleRestore(task.id)}
              >
                {loadingId === task.id ? 'Restoring...' : 'Restore'}
              </Button>
              <DialogYesOrNo
                title="Delete task forever?"
                description="This cannot be undone. The task will be permanently deleted."
                confirmText="Delete forever"
                cancelText="Cancel"
                variant="destructive"
                action={async () => {
                  await handleHardDelete(task.id);
                }}
              >
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deletingId === task.id || loadingId === task.id}
                >
                  {deletingId === task.id ? 'Deleting...' : 'Delete forever'}
                </Button>
              </DialogYesOrNo>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
