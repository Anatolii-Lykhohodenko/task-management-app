import { TaskForm } from '@/components/tasks/TaskForm';
import { updateTask } from '@/server/actions/tasks';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { findTaskInProject, getAssignees } from '@/lib/db/queries';
import { getCurrentUserId } from '@/lib/server/auth';

type Props = { params: Promise<{ projectId: string; taskId: string }> };

export default async function EditTaskPage({ params }: Props) {
  const { projectId, taskId } = await params;
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

  const [task, assignees] = await Promise.all([
    findTaskInProject({
      taskId: numericTaskId,
      projectId: numericProjectId,
      ownerId: userId,
      select: {
        title: true,
        status: true,
        priority: true,
        description: true,
        dueDate: true,
        assignee: { select: { id: true, name: true } },
      },
    }),
    getAssignees({ projectId: numericProjectId }),
  ]);

  if (!task) notFound();

  return (
    <div className="space-y-5">
      <Link
        href={`/projects/${projectId}/tasks/${taskId}`}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to task
      </Link>

      <div className="border-b pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Task
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Edit task
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update title, status, priority, and description.
        </p>
      </div>

      <Card className="max-w-2xl shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">{task.title}</CardTitle>
          <CardDescription className="text-xs">
            Save your changes when you&apos;re done.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TaskForm
            assignees={assignees}
            projectId={numericProjectId}
            serverAction={updateTask}
            taskId={numericTaskId}
            defaultValues={task}
          />
        </CardContent>
      </Card>
    </div>
  );
}
