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

export default function BoardCard({ task, projectId, isDragOverlay }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } =
    useDraggable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`rounded-md border bg-background px-3 py-2.5 text-sm font-medium shadow-sm ${
        isDragOverlay
          ? 'shadow-lg cursor-grabbing'
          : isDragging
            ? 'opacity-30'
            : 'cursor-grab'
      }`}
    >
      <Link
        href={`/projects/${projectId}/tasks/${task.id}`}
        onClick={(e) => isDragging && e.preventDefault()}
      >
        {task.title}
      </Link>
    </div>
  );
}
