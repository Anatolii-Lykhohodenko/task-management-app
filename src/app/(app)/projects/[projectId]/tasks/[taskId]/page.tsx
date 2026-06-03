import { deleteTask } from '@/server/actions/tasks';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DialogYesOrNo } from '../../../../../../components/ui/DialogYesOrNo';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
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
  ) {
    notFound();
  }

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
      assignee: {
        select: {
          name: true,
        },
      },
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

  const STATUS_LABEL: Record<string, string> = {
    OPEN: 'Open',
    DEVELOPING: 'In Progress',
    REVIEW: 'Review',
    CLOSED: 'Closed',
  };

  const PRIORITY_LABEL: Record<string, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
  };

  if (!task) notFound();

  const logs = await getActivityLogs({ taskId: numericTaskId });

  const deleteTaskWithIds = deleteTask.bind(null, {
    projectId: numericProjectId,
    taskId: numericTaskId,
  });

  return (
    <div className="space-y-6">
      <ToastHandler message={toast} />
      <div>
        <Link
          href={`/projects/${projectId}/tasks`}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to tasks
        </Link>
      </div>

      <div className="border-b pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Task
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {task.title}
        </h1>
        <div className="mt-3 flex items-center gap-2">
          <TaskProperties task={task} projectId={numericProjectId} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
              <CardDescription>Main details for this task</CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextContent
                content={task.description as Record<string, unknown> | null}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comments</CardTitle>
              <CardDescription>
                {task.comments.length === 0
                  ? 'No comments yet'
                  : `${task.comments.length} comment${task.comments.length === 1 ? '' : 's'}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.comments.length > 0 && (
                <div className="space-y-4">
                  {task.comments.map(
                    (comment: {
                      user: {
                        name: string;
                        id: number;
                      };
                      id: number;
                      createdAt: Date;
                      text: string;
                      replies: {
                        user: {
                          name: string;
                          id: number;
                        };
                        id: number;
                        createdAt: Date;
                        text: string;
                      }[];
                    }) => {
                      return (
                        <CommentItem
                          deleteAction={deleteComment}
                          createComment={createComment}
                          key={comment.id}
                          comment={comment}
                          projectId={numericProjectId}
                          taskId={numericTaskId}
                          currentUserId={userId}
                        />
                      );
                    }
                  )}
                </div>
              )}

              <div className="border-t pt-4">
                <CommentForm
                  serverAction={createComment}
                  projectId={numericProjectId}
                  taskId={numericTaskId}
                  userId={userId}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
              <CardDescription>Update or remove this task</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/projects/${projectId}/tasks/${taskId}/edit`}>
                  Edit task
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
                <Button variant="destructive">Delete task</Button>
              </DialogYesOrNo>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
              <CardDescription>Context fields for this task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Assignee
                </p>
                <p className="mt-1 font-medium">
                  {task.assignee?.name ?? 'Unassigned'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Due date
                </p>
                {task.dueDate ? (
                  <div className="mt-1 flex items-center gap-2">
                    <p className="font-medium">
                      {new Date(task.dueDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    {new Date(task.dueDate) < new Date() ? (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                        Overdue
                      </span>
                    ) : (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Estimated
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 font-medium text-muted-foreground">
                    Not set
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <p className="mt-1 font-medium">{STATUS_LABEL[task.status]}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Priority
                </p>
                <p className="mt-1 font-medium">
                  {PRIORITY_LABEL[task.priority]}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Created
                </p>
                <p className="mt-1 font-medium">
                  {task.createdAt.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
          <ActivityLog logs={'error' in logs ? [] : logs} />
        </div>
      </div>
    </div>
  );
}
