import prisma from '@/lib/db/client';
import { deleteTask } from '@/server/actions/tasks';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';

type Props = {
  params: Promise<{ projectId: string; taskId: string }>;
};

export default async function TaskPage({ params }: Props) {
  const { projectId, taskId } = await params;
  const deleteWithIds = deleteTask.bind(null, projectId, taskId);

  const task = await prisma.task.findUnique({
    where: {
      id: +taskId,
    },
    select: {
      title: true,
      status: true,
      priority: true,
      description: true,
      createdAt: true,
    },
  });

  if (!task) notFound();

  return (
    <div className="space-y-6">
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
          <Badge variant="secondary">{task.status}</Badge>
          <Badge variant="outline">{task.priority}</Badge>
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
              {task.description ? (
                <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                  {task.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No description provided.
                </p>
              )}
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

              <form action={deleteWithIds}>
                <Button type="submit" variant="destructive">
                  Delete task
                </Button>
              </form>
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
                  Status
                </p>
                <p className="mt-1 font-medium">{task.status}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Priority
                </p>
                <p className="mt-1 font-medium">{task.priority}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Created
                </p>
                <p className="mt-1 font-medium">
                  {task.createdAt.toDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
