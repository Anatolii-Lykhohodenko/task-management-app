'use client';

import { DueDateBadge } from '@/components/ui/DueDataBadge';
import { Priority, Status } from '@/types';
import { useDraggable } from '@dnd-kit/core';
import Link from 'next/link';

type Task = {
  id: number;
  title: string;
  description: unknown;
  status: Status;
  priority: Priority;
  createdAt: Date;
  deletedAt: Date | null;
  dueDate: Date | null;
  projectId: number;
  assigneeId: number | null;
};

type BoardTask = Pick<Task, 'id' | 'title' | 'status' | 'priority'> & {
  assignee: { name: string } | null;
  dueDate: Date | null;
};

type Props = {
  task: BoardTask;
  projectId: number;
  isDragOverlay?: boolean;
  isMobile?: boolean;
  onMove: (taskId: number, status: Status) => void | Promise<void>;
};

const priorityStyles = {
  LOW: 'bg-slate-100 text-slate-700 border-slate-200',
  MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
};

export default function BoardCard({
  task,
  projectId,
  isDragOverlay = false,
  isMobile = false,
  onMove,
}: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    disabled: isMobile || isDragOverlay,
  });

  return (
    <div
      ref={setNodeRef}
      {...(!isMobile && !isDragOverlay ? listeners : {})}
      {...(!isMobile && !isDragOverlay ? attributes : {})}
      className={`rounded-md border bg-background px-3 py-2.5 shadow-sm transition-colors select-none ${
        isDragOverlay
          ? 'cursor-grabbing shadow-lg'
          : !isMobile && isDragging
            ? 'opacity-30'
            : !isMobile
              ? 'cursor-grab hover:bg-muted/40'
              : ''
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/projects/${projectId}/tasks/${task.id}`}
            onClick={(e) => {
              if (isDragging) e.preventDefault();
            }}
            className="min-w-0 flex-1"
            draggable={false}
          >
            <p className="truncate text-sm font-medium text-blue-700 underline underline-offset-2">
              {task.title}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <p className="truncate text-xs text-muted-foreground">
                {task.assignee?.name ?? 'Unassigned'}
              </p>
              {task.dueDate && (
                <>
                  <span className="text-xs text-muted-foreground">·</span>
                  <DueDateBadge dueDate={task.dueDate} />
                </>
              )}
            </div>
          </Link>

          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              priorityStyles[task.priority]
            }`}
          >
            {task.priority}
          </span>
        </div>

        {isMobile && (
          <select
            value={task.status}
            onChange={(e) => onMove(task.id, e.target.value as Status)}
            className="h-8 w-full rounded-md border bg-background px-2 text-xs"
            aria-label="Change task status"
          >
            <option value="OPEN">Open</option>
            <option value="DEVELOPING">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="CLOSED">Closed</option>
          </select>
        )}
      </div>
    </div>
  );
}
