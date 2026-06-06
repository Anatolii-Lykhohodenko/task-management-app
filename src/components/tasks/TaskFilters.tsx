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
import { X, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Priority, Status } from '@/types';

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Open',
  DEVELOPING: 'In Progress',
  REVIEW: 'Review',
  CLOSED: 'Closed',
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-blue-500/10 text-blue-500',
  DEVELOPING: 'bg-amber-500/10 text-amber-500',
  REVIEW: 'bg-violet-500/10 text-violet-500',
  CLOSED: 'bg-emerald-500/10 text-emerald-500',
};

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
      router.refresh();
    },
    [router, searchParams]
  );

  const debounced = useMemo(
    () => debounce((val: string) => updateParam('search', val || null), 500),
    [updateParam]
  );

  useEffect(() => () => debounced.cancel(), [debounced]);

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
      {/* Quick filter toggles */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 gap-1.5 px-2.5 text-xs',
            myTasks
              ? 'bg-primary/10 text-primary hover:bg-primary/15'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => updateParam('myTasks', myTasks ? null : 'true')}
        >
          <User className="h-3 w-3" />
          My Tasks
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 gap-1.5 px-2.5 text-xs',
            overdue
              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/15'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => updateParam('overdue', overdue ? null : 'true')}
        >
          <AlertCircle className="h-3 w-3" />
          Overdue
        </Button>
      </div>

      {/* Search + selects */}
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
              <SelectTrigger className="h-8 w-full sm:w-34">
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
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-xs font-medium',
                        STATUS_STYLES[s]
                      )}
                    >
                      {STATUS_LABEL[s]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={priority ?? ''}
            onValueChange={(val) => updateParam('priority', val || null)}
          >
            <SelectTrigger className="h-8 w-full sm:w-34">
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
                  {PRIORITY_LABEL[p]}
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
            <SelectTrigger className="h-8 w-full sm:w-44">
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
              className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground sm:w-auto"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
