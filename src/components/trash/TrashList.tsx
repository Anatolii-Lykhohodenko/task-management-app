'use client';

import { Priority, Status } from '@prisma/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
}: Props) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex items-center justify-between rounded-lg border border-border bg-surface p-4"
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
            </p>
          </div>

          <div className="flex items-center gap-2">
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
      ))}
    </ul>
  );
}
