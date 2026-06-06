'use client';

import { updateTaskStatus } from '@/server/actions/tasks';
import { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers';
import BoardColumn from '../../../../../components/ui/BoardColumn';
import BoardCard from '@/components/ui/BoardCard';
import type { Priority, Status } from '@/types';

type BoardTask = {
  id: number;
  title: string;
  status: Status;
  priority: Priority;
  assignee: { name: string } | null;
  dueDate: Date | null;
};

type Props = {
  projectId: number;
  initialTasks: BoardTask[];
};

const boardSections = [
  { key: 'OPEN' as Status, label: 'Open' },
  { key: 'DEVELOPING' as Status, label: 'In Progress' },
  { key: 'REVIEW' as Status, label: 'Review' },
  { key: 'CLOSED' as Status, label: 'Closed' },
];

export default function BoardClient({ projectId, initialTasks }: Props) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const activeTask = tasks.find((t) => t.id === activeId);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const handleChange = () => setIsMobile(media.matches);
    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const columns = Object.fromEntries(
    boardSections.map(({ key }) => [key, tasks.filter((t) => t.status === key)])
  ) as Record<Status, BoardTask[]>;

  const moveTask = async (taskId: number, newStatus: Status) => {
    const snapshot = tasks;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTaskStatus({ taskId, projectId, status: newStatus });
    } catch {
      setTasks(snapshot);
    }
  };

  /* ── Mobile layout ─────────────────────────────────────── */
  if (isMobile) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Change status directly from each card.
        </p>
        {boardSections.map(({ key, label }) => (
          <section
            key={key}
            className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <span className="text-xs tabular-nums text-muted-foreground">
                {columns[key].length}
              </span>
            </div>
            {columns[key].length === 0 ? (
              <div className="rounded-md border border-dashed bg-background py-4 text-center text-xs text-muted-foreground">
                No tasks
              </div>
            ) : (
              <div className="space-y-2">
                {columns[key].map((task) => (
                  <BoardCard
                    key={task.id}
                    task={task}
                    projectId={projectId}
                    isMobile
                    onMove={moveTask}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    );
  }

  /* ── Desktop DnD layout ────────────────────────────────── */
  return (
    <DndContext
      id="board-dnd"
      sensors={sensors}
      modifiers={[restrictToFirstScrollableAncestor]}
      onDragStart={(e: DragStartEvent) => setActiveId(Number(e.active.id))}
      onDragEnd={async (e: DragEndEvent) => {
        setActiveId(null);
        if (!e.over) return;
        await moveTask(Number(e.active.id), e.over.id as Status);
      }}
    >
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
          {boardSections.map(({ key, label }) => (
            <div key={key} className="w-68 shrink-0">
              <BoardColumn id={key} label={label} count={columns[key].length}>
                {columns[key].length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">
                    No tasks
                  </p>
                ) : (
                  columns[key].map((task) => (
                    <BoardCard
                      key={task.id}
                      task={task}
                      projectId={projectId}
                      onMove={moveTask}
                    />
                  ))
                )}
              </BoardColumn>
            </div>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeTask && (
          <BoardCard
            task={activeTask}
            projectId={projectId}
            isDragOverlay
            onMove={moveTask}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
