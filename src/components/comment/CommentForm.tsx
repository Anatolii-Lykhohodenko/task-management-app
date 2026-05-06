'use client';

import { ActionState } from '@/types';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  serverAction: (
    prevState: ActionState | null,
    formData: FormData
  ) => Promise<ActionState>;
  projectId: number;
  taskId: number;
  commentId?: number;
  userId: number;
  parentId?: number;
  defaultValues?: {
    text: string;
  };
};

export default function CommentForm({
  serverAction,
  projectId,
  taskId,
  userId,
  commentId,
  parentId,
  defaultValues,
}: Props) {
  const [state, action, isPending] = useActionState(serverAction, null);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="userId" value={userId} />
      {commentId && <input type="hidden" name="commentId" value={commentId} />}

      <Textarea
        name="text"
        placeholder={
          defaultValues ? 'Edit your comment...' : 'Write a comment...'
        }
        defaultValue={defaultValues?.text ?? ''}
        rows={3}
        className="resize-none text-sm"
      />

      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      {state?.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}

      <div className="flex items-center justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending
            ? 'Saving...'
            : defaultValues
              ? 'Save changes'
              : 'Add comment'}
        </Button>
      </div>
    </form>
  );
}
