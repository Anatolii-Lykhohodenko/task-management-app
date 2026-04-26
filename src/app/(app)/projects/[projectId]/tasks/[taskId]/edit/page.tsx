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
import { findTaskInProject } from '@/lib/db/queries';

type Props = {
  params: Promise<{ projectId: string; taskId: string }>;
};

export default async function EditTaskPage({ params }: Props) {
  const { projectId, taskId } = await params;

  const numericProjectId = Number(projectId);
  const numericTaskId = Number(taskId);

  if (!numericProjectId || Number.isNaN(numericProjectId)) notFound();
  if (!numericTaskId || Number.isNaN(numericTaskId)) notFound();

  const task = await findTaskInProject(numericTaskId, numericProjectId, {
    title: true,
    status: true,
    priority: true,
    description: true,
  });

  if (!task) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${projectId}/tasks/${taskId}`}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to task
        </Link>
      </div>

      <div className="border-b pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Task
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Edit task
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update title, status, priority, and description.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">{task.title}</CardTitle>
          <CardDescription>Save your changes when you’re done.</CardDescription>
        </CardHeader>
        <CardContent>
          <TaskForm
            projectId={projectId}
            serverAction={updateTask}
            taskId={taskId}
            defaultValues={task}
          />
        </CardContent>
      </Card>
    </div>
  );
}
