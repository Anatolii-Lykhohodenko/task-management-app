import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/db/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { deleteProject } from '@/server/actions/projects';
import { DialogYesOrNo } from '@/components/ui/DialogYesOrNo';

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;

  const numericProjectId = Number(projectId);

  if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    select: {
      user: {
        select: {
          name: true,
        },
      },
      tasks: {
        select: {
          title: true,
          id: true,
          status: true,
          priority: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      },
      _count: {
        select: {
          tasks: true,
        },
      },
      name: true,
      createdAt: true,
    },
    where: { id: numericProjectId },
  });

  if (!project) notFound();

  const deleteWithIds = deleteProject.bind(null, projectId);
  const description = !project._count.tasks
    ? `This will permanently delete the project.`
    : project._count.tasks === 1
      ? `This will permanently delete the project and its ${project._count.tasks} task.`
      : `This will permanently delete the project and all ${project._count.tasks} tasks.`;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/`}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to projects
        </Link>
      </div>
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Project
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Owned by {project.user.name} · Created{' '}
            {project.createdAt.toDateString()}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href={`/projects/${projectId}/edit`}>Edit project</Link>
          </Button>

          <DialogYesOrNo
            title="Delete project?"
            description={description}
            confirmText="Delete project"
            cancelText="Cancel"
            variant="destructive"
            action={deleteWithIds}
          >
            <Button variant="destructive" className="w-full sm:w-auto">
              Delete project
            </Button>
          </DialogYesOrNo>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Recent tasks</CardTitle>
                <CardDescription>
                  Latest work items in this project
                </CardDescription>
              </div>
              <Link
                href={`/projects/${projectId}/tasks`}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {project._count.tasks === 0 ? (
                <div className="rounded-lg border border-dashed px-4 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No tasks yet</p>
                </div>
              ) : (
                <ul className="divide-y">
                  {project.tasks.map((task) => (
                    <li key={task.id}>
                      <Link
                        href={`/projects/${projectId}/tasks/${task.id}`}
                        className="flex items-start justify-between gap-4 rounded-md px-2 py-2 transition-colors hover:bg-muted/50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {task.title}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant="secondary">{task.status}</Badge>
                          <Badge variant="outline">{task.priority}</Badge>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project details</CardTitle>
              <CardDescription>Quick metadata and summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Owner
                </p>
                <p className="mt-1 font-medium">{project.user.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Created
                </p>
                <p className="mt-1 font-medium">
                  {project.createdAt.toDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total tasks
                </p>
                <p className="mt-1 font-medium">{project._count.tasks}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
