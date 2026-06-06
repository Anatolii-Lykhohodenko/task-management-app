'use client';

import { DueDateBadge } from '@/components/ui/DueDataBadge';
import type { Priority, Status } from '@/types';
import { useDraggable } from '@dnd-kit/core';
import Link from 'next/link';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

type BoardTask = {
  id: number;
  title: string;
  status: Status;
  priority: Priority;
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

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  MEDIUM: 'bg-orange-500/10 text-orange-500 border-orange-500/25',
  HIGH: 'bg-red-500/10 text-red-500 border-red-500/25',
  CRITICAL: 'bg-red-900/20 text-red-400 border-red-500/30',
};

const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'DEVELOPING', label: 'In Progress' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'CLOSED', label: 'Closed' },
];

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
      {...(!isMobile && !isDragOverlay ? attributes : {})}
      className={cn(
        'group rounded-lg border border-border/50 bg-card px-3 py-2.5 shadow-none transition-all select-none',
        isDragOverlay && 'cursor-grabbing shadow-lg border-border rotate-1',
        !isMobile && isDragging && 'opacity-30',
        !isMobile &&
          !isDragOverlay &&
          !isDragging &&
          'hover:border-border hover:shadow-sm'
      )}
    >
      <div className="space-y-2.5">
        <div className="flex items-start gap-2">
          {/* Drag handle */}
          {!isMobile && !isDragOverlay && (
            <button
              {...listeners}
              className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground/30 transition-colors hover:text-muted-foreground active:cursor-grabbing"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Title + meta */}
          <Link
            href={`/projects/${projectId}/tasks/${task.id}`}
            onClick={(e) => {
              if (isDragging) e.preventDefault();
            }}
            className="min-w-0 flex-1"
            draggable={false}
          >
            <p className="truncate text-sm font-medium transition-colors hover:text-primary">
              {task.title}
            </p>
          </Link>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {task.assignee ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-[9px] font-semibold text-primary uppercase">
                  {task.assignee.name[0]}
                </span>
                <span className="truncate max-w-20">
                  {task.assignee.name}
                </span>
              </span>
            ) : (
              <span className="text-xs text-muted-foreground/40">
                Unassigned
              </span>
            )}
            {task.dueDate && (
              <>
                <span className="text-muted-foreground/30 text-xs">·</span>
                <DueDateBadge dueDate={task.dueDate} />
              </>
            )}
          </div>

          <span
            className={cn(
              'shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              PRIORITY_STYLES[task.priority]
            )}
          >
            {PRIORITY_LABEL[task.priority]}
          </span>
        </div>

        {/* Mobile status selector */}
        {isMobile && (
          <select
            value={task.status}
            onChange={(e) => onMove(task.id, e.target.value as Status)}
            className="h-7 w-full rounded-md border border-border/50 bg-background px-2 text-xs text-foreground"
            aria-label="Change task status"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
