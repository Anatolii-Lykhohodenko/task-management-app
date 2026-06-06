/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import type { Action } from '@/types';
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
  defaultValues?: { text: string };
  onCancel?: Dispatch<SetStateAction<boolean>> | (() => void);
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
    <form action={action} className="space-y-2">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="userId" value={userId} />
      {commentId && <input type="hidden" name="commentId" value={commentId} />}
      {parentId && <input type="hidden" name="parentId" value={parentId} />}

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
          defaultValues
            ? 'Edit your comment…'
            : 'Write a comment… (Enter to send)'
        }
        defaultValue={defaultValues?.text ?? ''}
        rows={defaultValues ? 3 : 2}
        className="resize-none text-sm"
      />

      {state?.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() =>
              typeof onCancel === 'function' && onCancel(false as never)
            }
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          className="h-7 px-2.5 text-xs"
          disabled={isPending}
        >
          {isPending ? 'Saving…' : defaultValues ? 'Save changes' : 'Send'}
        </Button>
      </div>
    </form>
  );
}
