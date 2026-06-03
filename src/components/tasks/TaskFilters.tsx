'use client';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/constants/task';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { SortByParam } from '@/constants';
import { Priority, Status } from '@/types';

type Props = {
  search: string;
  status?: Status | null;
  priority: Priority | null;
  sortBy: SortByParam;
  skipStatus?: boolean;
  myTasks?: boolean;
  overdue?: boolean;
};

export default function TaskFilters({
  search,
  status,
  priority,
  sortBy,
  skipStatus = false,
  myTasks = false,
  overdue = false,
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
      router.refresh()
    },
    [router, searchParams]
  );

  const debounced = useMemo(
    () => debounce((val: string) => updateParam('search', val || null), 500),
    [updateParam]
  );

  useEffect(() => {
    return () => debounced.cancel();
  }, [debounced]);

  const isDefaultSort = sortBy === 'createdAt_desc';

  const hasFilters = skipStatus
    ? !!search || !!priority || !isDefaultSort || myTasks || overdue
    : !!search ||
      !!status ||
      !!priority ||
      !isDefaultSort ||
      myTasks ||
      overdue;

  const clearFilters = () => {
    router.push('?');
    setSearchValue('');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          variant={myTasks ? 'default' : 'outline'}
          size="sm"
          className="h-8"
          onClick={() => updateParam('myTasks', myTasks ? null : 'true')}
        >
          My Tasks
        </Button>
        <Button
          variant={overdue ? 'default' : 'outline'}
          size="sm"
          className="h-8"
          onClick={() => updateParam('overdue', overdue ? null : 'true')}
        >
          Overdue
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          value={searchValue}
          onChange={(e) => {
            debounced(e.target.value);
            setSearchValue(e.target.value);
          }}
          placeholder="Search tasks..."
          className="h-8 w-full sm:w-48"
        />

        <div className="grid grid-cols-2 gap-2 sm:contents">
          {!skipStatus && (
            <Select
              value={status ?? ''}
              onValueChange={(val) => updateParam('status', val || null)}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                side="bottom"
                align="start"
                sideOffset={4}
              >
                {TASK_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={priority ?? ''}
            onValueChange={(val) => updateParam('priority', val || null)}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              align="start"
              sideOffset={4}
            >
              {TASK_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:contents">
          <Select
            value={sortBy}
            onValueChange={(val) => updateParam('sortBy', val)}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              align="start"
              sideOffset={4}
            >
              <SelectItem value="createdAt_desc">Newest first</SelectItem>
              <SelectItem value="createdAt_asc">Oldest first</SelectItem>
              <SelectItem value="dueDate_asc">Due date: earliest</SelectItem>
              <SelectItem value="dueDate_desc">Due date: latest</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="w-full sm:w-auto"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
