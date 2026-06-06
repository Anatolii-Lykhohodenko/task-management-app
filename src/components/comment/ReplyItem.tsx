'use client';

import { useState } from 'react';
import CommentForm from '@/components/comment/CommentForm';
import DeleteCommentButton from '@/components/comment/DeleteCommentButton';
import { updateComment } from '@/server/actions/comments';
import type { Action, Reply } from '@/types';

type Props = {
  reply: Reply;
  currentUserId: number;
  deleteAction: Action;
  projectId: number;
  taskId: number;
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ReplyItem({
  reply,
  currentUserId,
  deleteAction,
  projectId,
  taskId,
}: Props) {
  const [showEditForm, setShowEditForm] = useState(false);
  const isOwn = reply.user.id === currentUserId;

  return (
    <div className="flex gap-2.5">
      {/* Avatar — smaller than top-level */}
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold uppercase text-muted-foreground">
        {reply.user.name[0]}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{reply.user.name}</span>
          <span className="text-xs text-muted-foreground/60">
            {formatDate(reply.createdAt)}
          </span>
        </div>

        {showEditForm ? (
          <div className="mt-2">
            <CommentForm
              serverAction={updateComment}
              defaultValues={{ text: reply.text }}
              projectId={projectId}
              taskId={taskId}
              userId={currentUserId}
              commentId={reply.id}
              onCancel={() => setShowEditForm(false)}
            />
          </div>
        ) : (
          <p className="mt-0.5 text-sm leading-relaxed text-foreground">
            {reply.text}
          </p>
        )}

        {isOwn && !showEditForm && (
          <div className="mt-1.5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowEditForm((v) => !v)}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Edit
            </button>
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
  );
}
