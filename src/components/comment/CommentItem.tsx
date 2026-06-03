'use client';

import { useState } from 'react';
import CommentForm from '@/components/comment/CommentForm';
import DeleteCommentButton from '@/components/comment/DeleteCommentButton';
import type { Action, Reply } from '@/types';
import { updateComment } from '@/server/actions/comments';
import ReplyItem from '@/components/comment/ReplyItem';

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

          {showEditForm ? (
            <CommentForm
              serverAction={updateComment}
              defaultValues={{ text: comment.text }}
              projectId={projectId}
              taskId={taskId}
              userId={currentUserId}
              commentId={comment.id}
              onCancel={() => setShowEditForm(false)}
            />
          ) : (
            <p className="mt-1 text-sm text-foreground">{comment.text}</p>
          )}

          <div className="mt-1.5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowReplyForm((v) => !v)}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {showReplyForm ? 'Cancel' : 'Reply'}
            </button>

            {comment.user.id === currentUserId && (
              <>
                <DeleteCommentButton
                  serverAction={deleteAction}
                  projectId={projectId}
                  taskId={taskId}
                  commentId={comment.id}
                />
                <button
                  type="button"
                  onClick={() => setShowEditForm((v) => !v)}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Edit
                </button>
              </>
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
