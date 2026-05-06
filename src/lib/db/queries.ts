import prisma from '@/lib/db/client';
import { Prisma } from '@prisma/client';

export async function findTaskInProject<T extends Prisma.TaskSelect>({
  taskId,
  projectId,
  ownerId,
  select,
}: {
  taskId: number;
  projectId: number;
  ownerId: number;
  select: T;
}) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
      project: {
        ownerId,
      },
    },
    select,
  });
}

export async function findCommentInTasks<T extends Prisma.CommentSelect>({
  taskId,
  projectId,
  ownerId,
  commentId,
  select,
}: {
  taskId: number;
  projectId: number;
  ownerId: number;
  commentId: number;
  select?: T;
}) {
  const task = await findTaskInProject({
    taskId,
    projectId,
    ownerId,
    select: { id: true },
  });

  if (!task) {
    return null;
  }

  return prisma.comment.findFirst({
    where: {
      id: commentId,
      taskId: task.id,
      userId: ownerId
    },
    select,
  });
}
