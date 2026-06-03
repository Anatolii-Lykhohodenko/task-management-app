'use client';
import { TrashList } from '@/components/trash/TrashList';
import { Input } from '@/components/ui/input';
import type { Priority, Status } from '@/types';
import { debounce } from 'lodash';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  search: string;
  projectId: number;
  tasks: Task[];
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

export default function TrashComponent({
  search = '',
  projectId,
  tasks,
  restoreAction,
  deleteAction,
  highlight,
}: Props) {
  const [searchValue, setSearchValue] = useState(search);
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
      router.refresh();
    },
    [router, searchParams]
  );
  const debounced = useMemo(
    () => debounce((val: string) => updateParam('search', val || null), 500),
    [updateParam]
  );

  useEffect(() => () => debounced.cancel(), [debounced]);
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

      <Input
        value={searchValue}
        onChange={(e) => {
          debounced(e.target.value);
          setSearchValue(e.target.value);
        }}
        placeholder="Search tasks..."
        className="h-8 w-full sm:w-48"
      />

      <TrashList
        tasks={tasks}
        projectId={projectId}
        restoreAction={restoreAction}
        deleteAction={deleteAction}
        highlight={highlight}
      />
    </div>
  );
}
