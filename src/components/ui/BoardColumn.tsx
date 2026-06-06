'use client';

import type { Status } from '@/types';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

type Props = {
  id: Status;
  label: string;
  count: number;
  children: React.ReactNode;
};

const COLUMN_ACCENT: Record<Status, string> = {
  OPEN: 'border-t-blue-500',
  DEVELOPING: 'border-t-amber-500',
  REVIEW: 'border-t-violet-500',
  CLOSED: 'border-t-emerald-500',
};

const COUNT_ACCENT: Record<Status, string> = {
  OPEN: 'bg-blue-500/10 text-blue-500',
  DEVELOPING: 'bg-amber-500/10 text-amber-500',
  REVIEW: 'bg-violet-500/10 text-violet-500',
  CLOSED: 'bg-emerald-500/10 text-emerald-500',
};

export default function BoardColumn({ id, label, count, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-border/50 border-t-2 bg-muted/20 p-3',
        COLUMN_ACCENT[id]
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold',
            COUNT_ACCENT[id]
          )}
        >
          {count}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-40 flex-col gap-2 rounded-md p-1 transition-colors',
          isOver && 'bg-muted/60 ring-1 ring-border/50'
        )}
      >
        {children}
      </div>
    </div>
  );
}
