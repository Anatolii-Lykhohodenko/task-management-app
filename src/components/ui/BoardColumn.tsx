'use client';

import { useDroppable } from '@dnd-kit/core';
import { Status } from '@prisma/client';

type Props = {
  id: Status;
  label: string;
  count: number;
  children: React.ReactNode;
};

export default function BoardColumn({ id, label, count, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span className="text-xs text-muted-foreground">{count}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 rounded-lg p-2 min-h-30 transition-colors ${
          isOver ? 'bg-muted/70' : 'bg-muted/40'
        }`}
      >
        {children}
      </div>
    </div>
  )
}
