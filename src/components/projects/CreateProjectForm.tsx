'use client';
import { createProject } from '@/server/actions/projects';
import { useActionState } from 'react';

export default function CreateProjectForm() {
  const [state, action, isPending] = useActionState(createProject, null);

  return (
    <>
      <h1>Create a new project</h1>
      <form action={action}>
        <label htmlFor="name">Name</label>
        <input type="text" name="name" id="name" />
        <button type="submit" disabled={isPending}>
          {isPending ? 'Creating..' : 'Create Project'}
        </button>
        {state?.error && <p>{state.error}</p>}
      </form>
    </>
  );
}
