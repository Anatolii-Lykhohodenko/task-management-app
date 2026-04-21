import TaskForm from '@/components/tasks/TaskForm';
import prisma from '@/lib/db/client';
import { updateTask } from '@/server/actions/tasks';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ projectId: string; taskId: string }>;
};
export default async function EditTaskPage({ params }: Props) {
  const { projectId, taskId } = await params;

  const task = await prisma.task.findUnique({
    where: {
      id: +taskId,
    },
    select: {
      title: true,
      status: true,
      priority: true,
      description: true
    }
  });

  if(!task) notFound()

  return (
    <>
      <Link href={`/projects/${projectId}/tasks/${taskId}`}>
        Back to current task page
      </Link>
      <TaskForm
        projectId={projectId}
        serverAction={updateTask}
        taskId={taskId}
        defaultValues={task}
      />
    </>
  );
}
