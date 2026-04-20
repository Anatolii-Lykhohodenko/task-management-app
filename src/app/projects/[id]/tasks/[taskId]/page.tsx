import prisma from '@/lib/db/client';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ id: string; taskId: string }>;
};

export default async function TaskPage({ params }: Props) {
  const { id, taskId } = await params;

  const task = await prisma.task.findUnique({
    where: {
      id: +taskId,
    },
    select: {
      title: true,
      status: true,
      priority: true,
      description: true,
      createdAt: true
    },
  });

  if (!task) notFound();

  return (
    <>
      <Link href={`/projects/${id}/tasks`}>Back to tasks</Link>
      <div>
        <div>
          <h1>{task.title}</h1>
          <p>Status = {task.status}</p>
          <p>Priority = {task.priority}</p>
          <p>CreatedAt = {task.createdAt.toDateString()}</p>
          <p>Description = {task.description}</p>
        </div>
      </div>
    </>
  );
}
