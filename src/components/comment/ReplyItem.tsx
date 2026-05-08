import CommentForm from '@/components/comment/CommentForm';
import DeleteCommentButton from '@/components/comment/DeleteCommentButton';
import { updateComment } from '@/server/actions/comments';
import { Action, Reply } from '@/types';
import { useState } from 'react';

type Props = {
  reply: Reply;
  currentUserId: number;
  deleteAction: Action;
  projectId: number;
  taskId: number;
};

export default function ReplyItem({
  reply,
  currentUserId,
  deleteAction,
  projectId,
  taskId,
}: Props) {
  const [showEditForm, setShowEditForm] = useState(false);

  return (
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

        {showEditForm ? (
          <CommentForm
            serverAction={updateComment}
            defaultValues={{ text: reply.text }}
            projectId={projectId}
            taskId={taskId}
            userId={currentUserId}
            commentId={reply.id}
            onCancel={() => setShowEditForm(false)}
          />
        ) : (
          <p className="mt-1 text-sm text-foreground">{reply.text}</p>
        )}

        <div className="mt-1.5 flex items-center gap-3">
          {reply.user.id === currentUserId && (
            <>
              <DeleteCommentButton
                serverAction={deleteAction}
                projectId={projectId}
                taskId={taskId}
                commentId={reply.id}
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
      </div>
    </div>
  );
}
