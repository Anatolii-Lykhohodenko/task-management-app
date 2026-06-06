'use client';

import { TrashList } from '@/components/trash/TrashList';
import { Input } from '@/components/ui/input';
import type { Priority, Status } from '@/types';
import { debounce } from 'lodash';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';

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
  deleteAction: (params: {
    projectId: number;
    taskId: number;
  }) => Promise<
    | { success: boolean; error: string }
    | { success: boolean; error?: undefined }
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
      if (value) params.set(key, value);
      else params.delete(key);
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
    <div className="space-y-5">
      {/* Breadcrumb */}
      <Link
        href={`/projects/${projectId}`}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to project
      </Link>

      {/* Header */}
      <div className="flex items-end justify-between border-b pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Trash
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Deleted tasks
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tasks.length === 0
              ? 'No deleted tasks.'
              : `${tasks.length} task${tasks.length === 1 ? '' : 's'} in trash — restore or permanently delete.`}
          </p>
        </div>
        {tasks.length > 0 && (
          <Trash2 className="mb-1 h-5 w-5 text-muted-foreground/40" />
        )}
      </div>

      {/* Search */}
      {tasks.length > 0 && (
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            value={searchValue}
            onChange={(e) => {
              debounced(e.target.value);
              setSearchValue(e.target.value);
            }}
            placeholder="Search deleted tasks..."
            className="h-8 pl-8"
          />
        </div>
      )}

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
