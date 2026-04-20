'use client';

import { createTask } from '@/server/actions/tasks';
import { useActionState } from 'react';
import { Status, Priority } from '@prisma/client';

const statuses = Object.values(Status);
const priorities = Object.values(Priority);

export default function CreateTaskForm({ projectId }: { projectId: string }) {
  const [state, action, isPending] = useActionState(createTask, null);

  return (
    <>
      <h1>Create a new task</h1>
      <form action={action}>
        <label htmlFor="title">Title</label>
        <input type="text" name="title" id="title" />
        <label htmlFor="status">Status</label>
        <select name="status" id="status" defaultValue={Status.OPEN}>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <label htmlFor="priority">Priority</label>
        <select name="priority" id="priority" defaultValue={Priority.MEDIUM}>
          {priorities.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" />
        <input type="hidden" name="projectId" value={projectId} />
        <button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create Task'}
        </button>
        {state?.error && <p>{state.error}</p>}
      </form>
    </>
  );
}
