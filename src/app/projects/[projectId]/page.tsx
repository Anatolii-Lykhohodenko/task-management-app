import { notFound } from 'next/navigation';
import prisma from '@/lib/db/client';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;

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
      name: true,
      createdAt: true,
    },
    where: { id: +projectId },
  });

  if (!project) notFound();

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <p className="text-sm text-muted-foreground">
          {project.user.name} · {project.createdAt.toDateString()}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Tasks</h2>
        {project.tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks yet</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border">
            {project.tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <Link
                  href={`/projects/${projectId}/tasks/${task.id}`}
                  className="text-sm font-medium hover:underline"
                >
                  {task.title}
                </Link>
                <div className="flex gap-2">
                  <Badge variant="outline">{task.status}</Badge>
                  <Badge variant="outline">{task.priority}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/projects/${projectId}/tasks`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View all tasks →
        </Link>
      </div>
    </div>
  );
}
