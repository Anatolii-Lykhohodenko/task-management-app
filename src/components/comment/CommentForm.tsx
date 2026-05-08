/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Action } from '@/types';
import {
  Dispatch,
  SetStateAction,
  useActionState,
  useEffect,
  useRef,
} from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  serverAction: Action;
  projectId: number;
  taskId: number;
  commentId?: number;
  userId: number;
  parentId?: number;
  defaultValues?: {
    text: string;
  };
  onCancel?: Dispatch<SetStateAction<boolean>>;
};

export default function CommentForm({
  serverAction,
  projectId,
  taskId,
  userId,
  commentId,
  parentId,
  defaultValues,
  onCancel,
}: Props) {
  const [state, action, isPending] = useActionState(serverAction, null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (defaultValues && textareaRef.current) {
      const trimmed = textareaRef.current.value.trimEnd();
      textareaRef.current.value = trimmed;
      textareaRef.current.setSelectionRange(trimmed.length, trimmed.length);
      textareaRef.current.focus();
    }
  }, []);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="userId" value={userId} />
      {commentId && <input type="hidden" name="commentId" value={commentId} />}

      <Textarea
        ref={textareaRef}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
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
        {onCancel && (
          <Button type="button" size="sm" onClick={() => onCancel(false)}>
            Cancel
          </Button>
        )}
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
