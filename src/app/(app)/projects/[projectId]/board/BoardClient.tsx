'use client';

import { updateTaskStatus } from '@/server/actions/tasks';
import { Status, Task } from '@prisma/client';
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

type BoardTask = Pick<Task, 'id' | 'title' | 'status' | 'priority'> & {
  assignee: { name: string } | null;
  dueDate: Date | null;
};

type Props = {
  projectId: number;
  initialTasks: BoardTask[];
};

const boardSections = [
  { key: 'OPEN', label: 'Open' },
  { key: 'DEVELOPING', label: 'In Progress' },
  { key: 'REVIEW', label: 'Review' },
  { key: 'CLOSED', label: 'Closed' },
] as const;

export default function BoardClient({ projectId, initialTasks }: Props) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const activeTask = tasks.find((task) => task.id === activeId);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');

    const handleChange = () => setIsMobile(media.matches);

    handleChange();
    media.addEventListener('change', handleChange);

    return () => media.removeEventListener('change', handleChange);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  const columns = {
    OPEN: tasks.filter((t) => t.status === 'OPEN'),
    DEVELOPING: tasks.filter((t) => t.status === 'DEVELOPING'),
    REVIEW: tasks.filter((t) => t.status === 'REVIEW'),
    CLOSED: tasks.filter((t) => t.status === 'CLOSED'),
  };

  const moveTask = async (taskId: number, newStatus: Status) => {
    const snapshot = tasks;
    const task = tasks.find((task) => task.id === taskId);

    if (!task || task.status === newStatus) return;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      await updateTaskStatus({
        taskId,
        projectId,
        status: newStatus,
      });
    } catch {
      setTasks(snapshot);
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);

    const { active, over } = event;
    if (!over) return;

    const taskId = Number(active.id);
    const newStatus = over.id as Status;

    await moveTask(taskId, newStatus);
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Browse tasks by status. Change status directly from each card.
        </p>

        {boardSections.map(({ key, label }) => (
          <section
            key={key}
            className="space-y-2 rounded-lg border bg-muted/20 p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <span className="text-xs text-muted-foreground">
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

  return (
    <DndContext
      id="board-dnd"
      sensors={sensors}
      modifiers={[restrictToFirstScrollableAncestor]}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4">
          {boardSections.map(({ key, label }) => (
            <div key={key} className="w-70 shrink-0">
              <BoardColumn id={key} label={label} count={columns[key].length}>
                {columns[key].length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
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
        {activeTask ? (
          <BoardCard
            task={activeTask}
            projectId={projectId}
            isDragOverlay
            onMove={moveTask}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
