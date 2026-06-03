'use client';

import type { Status } from '@/types';
import { useDroppable } from '@dnd-kit/core';

type Props = {
  id: Status;
  label: string;
  count: number;
  children: React.ReactNode;
};

export default function BoardColumn({ id, label, count, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-muted/30 p-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <span className="flex h-5 items-center justify-center rounded-full bg-muted px-2 text-[11px] font-medium text-muted-foreground">
          {count}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-40 flex-col gap-2 rounded-md p-1 transition-colors ${
          isOver ? 'bg-muted/70' : 'bg-transparent'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
