import { deleteTask } from '@/server/actions/tasks';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DialogYesOrNo } from '../../../../../../components/ui/DialogYesOrNo';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { findTaskInProject, getActivityLogs } from '@/lib/db/queries';
import { getCurrentUserId } from '@/lib/server/auth';
import CommentForm from '@/components/comment/CommentForm';
import { createComment, deleteComment } from '@/server/actions/comments';
import CommentItem from '@/components/comment/CommentItem';
import { TaskProperties } from '@/components/ui/TaskPropeties';
import ActivityLog from '@/components/ui/ActivityLog';
import RichTextContent from '@/components/ui/RichTextContent';
import { ToastHandler } from '@/components/ui/ToastHandler';
import { DueDateBadge } from '@/components/ui/DueDataBadge';
import { Pencil, Trash2, Calendar, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  params: Promise<{ projectId: string; taskId: string }>;
  searchParams: Promise<{ toast?: string }>;
};

export default async function TaskPage({ params, searchParams }: Props) {
  const { projectId, taskId } = await params;
  const { toast } = await searchParams;
  const numericProjectId = Number(projectId);
  const numericTaskId = Number(taskId);

  const userId = await getCurrentUserId();
  if (!userId) return null;

  if (
    !Number.isInteger(numericProjectId) ||
    numericProjectId <= 0 ||
    !Number.isInteger(numericTaskId) ||
    numericTaskId <= 0
  )
    notFound();

  const task = await findTaskInProject({
    taskId: numericTaskId,
    projectId: numericProjectId,
    ownerId: userId,
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      description: true,
      dueDate: true,
      assignee: { select: { name: true } },
      createdAt: true,
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          text: true,
          createdAt: true,
          user: { select: { id: true, name: true } },
          replies: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              text: true,
              createdAt: true,
              user: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!task) notFound();

  const logs = await getActivityLogs({ taskId: numericTaskId });
  const deleteTaskWithIds = deleteTask.bind(null, {
    projectId: numericProjectId,
    taskId: numericTaskId,
  });

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div className="space-y-5">
      <ToastHandler message={toast} />

      <Link
        href={`/projects/${projectId}/tasks`}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to tasks
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Task
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight leading-snug">
              {task.title}
            </h1>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href={`/projects/${projectId}/tasks/${taskId}/edit`}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Link>
            </Button>
            <DialogYesOrNo
              title="Delete task?"
              description="The task will be moved to trash. You can restore it after deletion."
              confirmText="Delete task"
              cancelText="Cancel"
              variant="destructive"
              action={deleteTaskWithIds}
            >
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                Delete
              </Button>
            </DialogYesOrNo>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <TaskProperties task={task} projectId={numericProjectId} />

          {task.assignee && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-[9px] font-semibold text-primary uppercase">
                {task.assignee.name[0]}
              </span>
              {task.assignee.name}
            </span>
          )}

          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <DueDateBadge dueDate={task.dueDate} />
            </span>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5">
          {/* Description */}
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextContent
                content={task.description as Record<string, unknown> | null}
              />
            </CardContent>
          </Card>

          {/* Comments */}
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">
                  Comments
                  {task.comments.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                      {task.comments.length}
                    </span>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-0 p-0">
              {task.comments.length > 0 && (
                <div className="divide-y divide-border/40 border-t border-border/40">
                  {task.comments.map(
                    (comment: {
                      user: { name: string; id: number };
                      id: number;
                      createdAt: Date;
                      text: string;
                      replies: {
                        user: { name: string; id: number };
                        id: number;
                        createdAt: Date;
                        text: string;
                      }[];
                    }) => (
                      <CommentItem
                        deleteAction={deleteComment}
                        createComment={createComment}
                        key={comment.id}
                        comment={comment}
                        projectId={numericProjectId}
                        taskId={numericTaskId}
                        currentUserId={userId}
                      />
                    )
                  )}
                </div>
              )}
              <div
                className={cn(
                  'px-6 py-4',
                  task.comments.length > 0 && 'border-t border-border/40'
                )}
              >
                <CommentForm
                  serverAction={createComment}
                  projectId={numericProjectId}
                  taskId={numericTaskId}
                  userId={userId}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  label: 'Assignee',
                  value: task.assignee ? (
                    <span className="flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary uppercase">
                        {task.assignee.name[0]}
                      </span>
                      {task.assignee.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  ),
                },
                {
                  label: 'Due date',
                  value: task.dueDate ? (
                    <span
                      className={cn(
                        'flex items-center gap-1.5',
                        isOverdue && 'text-destructive'
                      )}
                    >
                      {new Date(task.dueDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {isOverdue && (
                        <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
                          Overdue
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  ),
                },
                {
                  label: 'Created',
                  value: task.createdAt.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  }),
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-3"
                >
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {label}
                  </p>
                  <p className="text-right text-xs font-medium">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <ActivityLog logs={'error' in logs ? [] : logs} />
        </div>
      </div>
    </div>
  );
}
