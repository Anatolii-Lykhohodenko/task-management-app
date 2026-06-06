'use client';

import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogYesOrNo } from '@/components/ui/DialogYesOrNo';
import { cn } from '@/lib/utils';
import { RotateCcw, Trash2, FilePlus } from 'lucide-react';
import type { Priority, Status } from '@/types';

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
  deleteAction: (params: {
    projectId: number;
    taskId: number;
  }) => Promise<
    | { success: boolean; error: string }
    | { success: boolean; error?: undefined }
  >;
};

const STATUS_STYLES: Record<Status, string> = {
  OPEN: 'bg-blue-500/10 text-blue-500',
  DEVELOPING: 'bg-amber-500/10 text-amber-500',
  REVIEW: 'bg-violet-500/10 text-violet-500',
  CLOSED: 'bg-emerald-500/10 text-emerald-500',
};

const STATUS_LABEL: Record<Status, string> = {
  OPEN: 'Open',
  DEVELOPING: 'In Progress',
  REVIEW: 'Review',
  CLOSED: 'Closed',
};

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: 'bg-slate-500/10 text-slate-400',
  MEDIUM: 'bg-orange-500/10 text-orange-500',
  HIGH: 'bg-red-500/10 text-red-500',
  CRITICAL: 'bg-red-900/20 text-red-400',
};

const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

function deletedAgo(date: Date | null): string {
  if (!date) return '—';
  const days = Math.round(
    (+new Date() - +new Date(date)) / (1000 * 60 * 60 * 24)
  );
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

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

  const handleRestore = async (taskId: number) => {
    setLoadingId(taskId);
    try {
      const result = await restoreAction({ projectId, taskId });
      if (!result.success) {
        toast.error(result.error ?? 'Something went wrong');
        return;
      }
      toast.success('Task restored');
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
      toast.success('Task permanently deleted');
      router.refresh();
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeletingId(null);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
          <FilePlus className="h-4.5 w-4.5" />
        </div>
        <p className="text-sm font-medium">Trash is empty</p>
        <p className="mt-1 text-xs text-muted-foreground">
          No deleted tasks found.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => {
        const isHighlighted = task.id === highlight;
        const isBusy = loadingId === task.id || deletingId === task.id;

        return (
          <li
            key={task.id}
            ref={isHighlighted ? highlightRef : null}
            className={cn(
              'flex flex-col gap-3 rounded-lg border p-4 transition-all sm:flex-row sm:items-center sm:justify-between',
              isHighlighted
                ? 'border-primary/40 bg-primary/5'
                : 'border-border/50 bg-card hover:border-border'
            )}
          >
            {/* Info */}
            <div className="min-w-0 space-y-1.5">
              <p className="truncate text-sm font-medium">{task.title}</p>

              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    STATUS_STYLES[task.status]
                  )}
                >
                  {STATUS_LABEL[task.status]}
                </span>
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    PRIORITY_STYLES[task.priority]
                  )}
                >
                  {PRIORITY_LABEL[task.priority]}
                </span>
                {task.assignee && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-[9px] font-semibold text-primary uppercase">
                      {task.assignee.name[0]}
                    </span>
                    {task.assignee.name}
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground/70">
                Deleted by{' '}
                <span className="font-medium text-muted-foreground">
                  {task.logs[0]?.user?.name ?? 'Unknown'}
                </span>
                {task.deletedAt && (
                  <>
                    {' '}
                    ·{' '}
                    {new Date(task.deletedAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    <span className="text-muted-foreground/50">
                      ({deletedAgo(task.deletedAt)})
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={isBusy}
                onClick={() => handleRestore(task.id)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {loadingId === task.id ? 'Restoring…' : 'Restore'}
              </Button>

              <DialogYesOrNo
                title="Delete forever?"
                description="This cannot be undone. The task will be permanently deleted."
                confirmText="Delete forever"
                cancelText="Cancel"
                variant="destructive"
                action={async () => {
                  await handleHardDelete(task.id);
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={isBusy}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deletingId === task.id ? 'Deleting…' : 'Delete'}
                </Button>
              </DialogYesOrNo>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
