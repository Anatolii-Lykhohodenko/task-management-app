'use client';

import { useActionState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Action } from '@/types';

type Props = {
  serverAction: Action;
  projectId?: string;
  defaultValues?: { name: string };
};

export function ProjectForm({ serverAction, projectId, defaultValues }: Props) {
  const [state, action, isPending] = useActionState(serverAction, null);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm">
          Project name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={defaultValues?.name ?? ''}
          placeholder="e.g. Website redesign"
        />
        {projectId && (
          <input type="hidden" name="projectId" value={projectId} />
        )}
      </div>

      {state?.error && (
        <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending} size="sm" className="w-full">
        {isPending
          ? 'Saving…'
          : defaultValues
            ? 'Save changes'
            : 'Create project'}
      </Button>
    </form>
  );
}
