'use client';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/constants/task';
import { Priority, Status } from '@prisma/client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Props = {
  search: string;
  status: Status | null;
  priority: Priority | null;
  sortBy: 'asc' | 'desc';
};

export default function TaskFilters({
  search,
  status,
  priority,
  sortBy,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const debounced = useMemo(
    () => debounce((val: string) => updateParam('search', val || null), 500),
    [updateParam]
  );

  const hasFilters = !!search || !!status || !!priority || sortBy !== 'desc';

  const clearFilters = () => router.push('?');

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        defaultValue={search}
        onChange={(e) => debounced(e.target.value)}
        placeholder="Search tasks..."
        className="h-8 w-48"
      />

      <Select
        value={status ?? ''}
        onValueChange={(val) => updateParam('status', val || null)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {TASK_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={priority ?? ''}
        onValueChange={(val) => updateParam('priority', val || null)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          {TASK_PRIORITIES.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sortBy}
        onValueChange={(val) => updateParam('sortBy', val)}
      >
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Newest first</SelectItem>
          <SelectItem value="asc">Oldest first</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
