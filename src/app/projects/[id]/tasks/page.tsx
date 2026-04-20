import CreateTaskForm from '@/components/tasks/CreateTaskForm';
import prisma from '@/lib/db/client';
import Link from 'next/link';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TasksPage({ params }: Props) {
  const { id } = await params;
  const tasks = await prisma.task.findMany({
    where: {
      projectId: +id,
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
              <Link href={`/projects/${id}/tasks/${task.id}`}>
                {task.title}
              </Link>
            </li>
          );
        })}
      </ul>
      <CreateTaskForm projectId={id} />
    </>
  );
}
