import TaskForm from '@/components/tasks/TaskForm';
import prisma from '@/lib/db/client';
import { createTask } from '@/server/actions/tasks';
import Link from 'next/link';

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function TasksPage({ params }: Props) {
  const { projectId } = await params;
  const tasks = await prisma.task.findMany({
    where: {
      projectId: +projectId,
    },
    select: {
      id: true,
      title: true,
    },
  });

  return (
    <>
      <h1>Tasks</h1>
      <ul>
        {tasks.map((task) => {
          return (
            <li key={task.id}>
              <Link href={`/projects/${projectId}/tasks/${task.id}`}>
                {task.title}
              </Link>
            </li>
          );
        })}
      </ul>
      <TaskForm projectId={projectId} serverAction={createTask} />
    </>
  );
}
