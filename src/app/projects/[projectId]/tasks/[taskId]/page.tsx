import prisma from '@/lib/db/client';
import { deleteTask } from '@/server/actions/tasks';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
      createdAt: true
    },
  });

  if (!task) notFound();

  return (
    <>
      <Link href={`/projects/${projectId}/tasks`}>Back to tasks</Link>
      <div>
        <div>
          <h1>{task.title}</h1>
          <p>Status = {task.status}</p>
          <p>Priority = {task.priority}</p>
          <p>CreatedAt = {task.createdAt.toDateString()}</p>
          <p>Description = {task.description}</p>
        </div>
        <Link href={`/projects/${projectId}/tasks/${taskId}/edit`}>
          Edit task
        </Link>
        <form action={deleteWithIds}>
          <button type="submit">Delete task</button>
        </form>
      </div>
    </>
  );
}
