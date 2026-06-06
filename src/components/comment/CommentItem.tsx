'use client';

import { useState } from 'react';
import CommentForm from '@/components/comment/CommentForm';
import DeleteCommentButton from '@/components/comment/DeleteCommentButton';
import ReplyItem from '@/components/comment/ReplyItem';
import { updateComment } from '@/server/actions/comments';
import type { Action, Reply } from '@/types';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

type CommentItemProps = {
  deleteAction: Action;
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
  createComment: Action;
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function CommentItem({
  deleteAction,
  comment,
  projectId,
  taskId,
  currentUserId,
  createComment,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const isOwn = comment.user.id === currentUserId;

  return (
    <div className="px-6 py-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold uppercase text-primary">
          {comment.user.name[0]}
        </div>

        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium">{comment.user.name}</span>
            <span className="text-xs text-muted-foreground/60">
              {formatDate(comment.createdAt)}
            </span>
          </div>

          {/* Body */}
          {showEditForm ? (
            <div className="mt-2">
              <CommentForm
                serverAction={updateComment}
                defaultValues={{ text: comment.text }}
                projectId={projectId}
                taskId={taskId}
                userId={currentUserId}
                commentId={comment.id}
                onCancel={() => setShowEditForm(false)}
              />
            </div>
          ) : (
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {comment.text}
            </p>
          )}

          {/* Actions */}
          {!showEditForm && (
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowReplyForm((v) => !v)}
                className={cn(
                  'flex items-center gap-1 text-xs transition-colors',
                  showReplyForm
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <MessageSquare className="h-3 w-3" />
                {showReplyForm ? 'Cancel' : 'Reply'}
              </button>

              {isOwn && (
                <>
                  <span className="text-border">·</span>
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
                    commentId={comment.id}
                  />
                </>
              )}
            </div>
          )}

          {/* Reply form */}
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

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="ml-10 mt-3 space-y-3 border-l border-border/40 pl-4">
          {comment.replies.map((reply: Reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              deleteAction={deleteAction}
              currentUserId={currentUserId}
              projectId={projectId}
              taskId={taskId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
