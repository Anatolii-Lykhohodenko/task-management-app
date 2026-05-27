'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { restoreTask } from '@/server/actions/tasks';

export function ToastHandler({ message }: { message?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shown = useRef(false);

  const taskId = searchParams.get('taskId');
  const projectId = searchParams.get('projectId');
  const numericTaskId = taskId ? Number(taskId) : null;
  const numericProjectId = projectId ? Number(projectId) : null;

  useEffect(() => {
    if (!message || shown.current) return;
    shown.current = true;

    const replaceWithoutParams = (keys: string[]) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const key of keys) {
        params.delete(key);
      }

      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ''}`);
    };

    const messages: Record<string, string> = {
      task_created: '✓ Task created',
      task_updated: '✓ Task updated',
      task_deleted: '✓ Task deleted',
      task_restored: '✓ Task restored',
      comment_created: '✓ Comment created',
      comment_updated: '✓ Comment updated',
      comment_deleted: '✓ Comment deleted',
      task_status_and_priority_updated: '✓ Task status and priority updated',
      task_priority_updated: '✓ Task priority updated',
      task_status_updated: '✓ Task status updated',
    };

    if (message === 'task_deleted') {
      toast.success(messages[message] ?? message, {
        action: {
          label: 'Undo',
          onClick: async () => {
            if (!numericTaskId || !numericProjectId) {
              toast.error('Unable to restore task');
              return;
            }

            try {
              const result = await restoreTask({
                taskId: numericTaskId,
                projectId: numericProjectId,
              });

              if (!result.success) {
                toast.error(result.error || 'Something went wrong');
                return;
              }

              replaceWithoutParams(['toast', 'taskId', 'projectId']);
              router.refresh();
              toast.success(messages.task_restored);
            } catch {
              toast.error('Failed to restore task');
            }
          },
        },
      });

      replaceWithoutParams(['toast']);
      return;
    }

    toast.success(messages[message] ?? message);
    replaceWithoutParams(['toast']);
  }, [
    message,
    pathname,
    router,
    searchParams,
    numericTaskId,
    numericProjectId,
  ]);

  return null;
}
