'use client';

import { useState } from 'react';
import CommentForm from '@/components/comment/CommentForm';
import DeleteCommentButton from '@/components/comment/DeleteCommentButton';
import { createComment } from '@/server/actions/comments';
import { ActionState } from '@/types';

type Reply = {
  id: number;
  text: string;
  createdAt: Date;
  user: { id: number; name: string };
};

type CommentItemProps = {
  deleteAction: (
    prevState: ActionState | null,
    formData: FormData
  ) => Promise<ActionState>;
  comment: {
    id: number;
    text: string;
    createdAt: Date;
    user: { id: number; name: string };
    replies: Reply[];
  };
  projectId: number;
  taskId: number;
  currentUserId: number;
};

export default function CommentItem({
  deleteAction,
  comment,
  projectId,
  taskId,
  currentUserId,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase">
          {comment.user.name[0]}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium">{comment.user.name}</span>
            <span className="text-xs text-muted-foreground">
              {comment.createdAt.toLocaleDateString()}
            </span>
          </div>

          <p className="mt-1 text-sm text-foreground">{comment.text}</p>

          <div className="mt-1.5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowReplyForm((v) => !v)}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {showReplyForm ? 'Cancel' : 'Reply'}
            </button>

            {comment.user.id === currentUserId && (
              <DeleteCommentButton
                serverAction={deleteAction}
                projectId={projectId}
                taskId={taskId}
                commentId={comment.id}
              />
            )}
          </div>

          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                serverAction={createComment}
                projectId={projectId}
                taskId={taskId}
                userId={currentUserId}
                parentId={comment.id}
              />
            </div>
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div className="ml-11 space-y-3 border-l pl-4">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase">
                {reply.user.name[0]}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">{reply.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {reply.createdAt.toLocaleDateString()}
                  </span>
                </div>

                <p className="mt-1 text-sm text-foreground">{reply.text}</p>

                {reply.user.id === currentUserId && (
                  <div className="mt-1.5">
                    <DeleteCommentButton
                      serverAction={deleteAction}
                      projectId={projectId}
                      taskId={taskId}
                      commentId={reply.id}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
