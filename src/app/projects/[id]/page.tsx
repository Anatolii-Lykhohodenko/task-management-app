import { notFound } from 'next/navigation';
import prisma from '@/lib/db/client';
import Link from 'next/link';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;

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
    where: { id: +id },
  });

  if (!project) notFound();

  return (
    <div>
      <div>
        <h1>{project.name}</h1>
        <p>OwnerId = {project.user.name}</p>
        <p>CreatedAt = {project.createdAt.toDateString()}</p>
      </div>

      <div>
        <h2>Tasks</h2>
        {project.tasks.length === 0 ? (
          <p>No tasks yet</p>
        ) : (
          <ul>
            {project.tasks.map((task) => {
              return (
                <li key={task.id}>
                  <Link href={`/projects/${id}/tasks/${task.id}`}>{task.title}</Link>
                  <span>{task.status}</span>
                  <span>{task.priority}</span>
                </li>
              );
            })}
          </ul>
        )}
        <Link href={`/projects/${id}/tasks`}>View all tasks →</Link>
      </div>
    </div>
  );
}
