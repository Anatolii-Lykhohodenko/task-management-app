'use client';

import { useDraggable } from '@dnd-kit/core';
import { Task } from '@prisma/client';
import Link from 'next/link';

type BoardTask = Pick<Task, 'id' | 'title' | 'status' | 'priority'>;

type Props = {
  task: BoardTask;
  projectId: number;
  isDragOverlay?: boolean;
};

const priorityStyles = {
  LOW: 'bg-slate-100 text-slate-700 border-slate-200',
  MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
};

export default function BoardCard({ task, projectId, isDragOverlay }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`rounded-md border bg-background shadow-sm transition-colors ${
        isDragOverlay
          ? 'shadow-lg cursor-grabbing'
          : isDragging
            ? 'opacity-30'
            : 'cursor-grab hover:bg-muted/40'
      }`}
    >
      <Link
        href={`/projects/${projectId}/tasks/${task.id}`}
        onClick={(e) => isDragging && e.preventDefault()}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="flex items-center justify-between gap-3 px-3 py-2.5"
      >
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-blue-700 underline underline-offset-2 transition-colors group-hover:text-blue-800">
          {task.title}
        </p>

        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            priorityStyles[task.priority]
          }`}
        >
          {task.priority}
        </span>
      </Link>
    </div>
  );
}
