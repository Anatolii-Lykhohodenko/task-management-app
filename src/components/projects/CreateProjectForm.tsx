'use client'
import { createProject } from '@/server/actions/projects';
import { useActionState } from 'react';

export default function CreateProjectForm () {
  const [state, action, isPending] = useActionState(createProject, null);

  return (
    <form action={action}>
      <h1>Create a new project</h1>
      <label htmlFor="name">Name</label>
      <input type="text" name="name" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Submitting' : 'Submit'}
      </button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}