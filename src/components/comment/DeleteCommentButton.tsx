'use client';

import { useActionState } from 'react';
import type { Action } from '@/types';

type Props = {
  serverAction: Action;
  projectId: number;
  taskId: number;
  commentId: number;
};

export default function DeleteCommentButton({
  serverAction,
  projectId,
  taskId,
  commentId,
}: Props) {
  const [state, action, isPending] = useActionState(serverAction, null);

  return (
    <form action={action}>
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="commentId" value={commentId} />

      {state?.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}

      <button
        type="submit"
        className="text-xs text-muted-foreground transition-colors hover:text-destructive"
        disabled={isPending}
      >
        {isPending ? 'Deleting...' : 'Delete'}
      </button>
    </form>
  );
}
