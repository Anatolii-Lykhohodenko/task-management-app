'use client';

import { updateTaskStatus } from '@/server/actions/tasks';
import { Status, Task } from '@prisma/client';
import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers';

import BoardColumn from '../../../../../components/ui/BoardColumn';
import BoardCard from '@/components/ui/BoardCard';

type BoardTask = Pick<Task, 'id' | 'title' | 'status' | 'priority'>;

type Props = {
  projectId: number;
  initialTasks: BoardTask[];
};

export default function BoardClient({ projectId, initialTasks }: Props) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeId, setActiveId] = useState<number | null>(null);
  const activeTask = tasks.find((task) => task.id === activeId);

  const columns = {
    OPEN: tasks.filter((t) => t.status === 'OPEN'),
    DEVELOPING: tasks.filter((t) => t.status === 'DEVELOPING'),
    REVIEW: tasks.filter((t) => t.status === 'REVIEW'),
    CLOSED: tasks.filter((t) => t.status === 'CLOSED'),
  };

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    setActiveId(null);

    const snapshot = tasks;
    const taskId = Number(active.id);
    const newStatus = over.id as Status;
    const task = tasks.find((task) => task.id === taskId);

    if (task?.status === newStatus) {
      return;
    }

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

  return (
    <DndContext
      id="board-dnd"
      modifiers={[restrictToFirstScrollableAncestor]}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    >
      <div className="overflow-x-auto pb-4">
        <div className="grid min-w-160 grid-cols-4 gap-4">
          {(
            [
              { key: 'OPEN', label: 'Open' },
              { key: 'DEVELOPING', label: 'In Progress' },
              { key: 'REVIEW', label: 'Review' },
              { key: 'CLOSED', label: 'Closed' },
            ] as const
          ).map(({ key, label }) => (
            <BoardColumn
              key={key}
              id={key}
              label={label}
              count={columns[key].length}
            >
              {columns[key].length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  No tasks
                </p>
              ) : (
                columns[key].map((task) => (
                  <BoardCard key={task.id} task={task} projectId={projectId} />
                ))
              )}
            </BoardColumn>
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeTask ? (
          <BoardCard task={activeTask} projectId={projectId} isDragOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
