'use client';

import { useActionState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionState } from '@/types';

type Props = {
  serverAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>,
  projectId?: string,
  defaultValues?: {
    name: string
  }
}

export function ProjectForm({
  serverAction,
  projectId,
  defaultValues,
}: Props) {
  const [state, action, isPending] = useActionState(serverAction, null);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={defaultValues?.name || ''}
          placeholder="Enter project name"
        />
        {projectId && <input type="hidden" name="projectId" value={projectId} />}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? 'Saving...'
            : defaultValues
              ? 'Save changes'
              : 'Create project'}
        </Button>
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
