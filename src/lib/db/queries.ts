import prisma from '@/lib/db/client';
import { getCurrentUserId } from '@/lib/server/auth';
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
      userId: ownerId,
    },
    select,
  });
}

export async function getDashBoardStats() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const ownerId = Number(userId);

  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({
      where: {
        ownerId,
      },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.task.findMany({
      where: {
        project: {
          ownerId,
        },
      },
      select: { status: true, id: true },
    }),
  ]);

  return { projects, tasks };
}

export async function getRecentTasks() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const ownerId = Number(userId);

  const recentTasks = await prisma.task.findMany({
    where: {
      project: {
        ownerId,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      projectId: true,
      project: {
        select: { name: true },
      },
    },
  });

  return recentTasks;
}

export async function getRecentComments() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const ownerId = Number(userId);

  const recentComments = await prisma.comment.findMany({
    where: {
      userId: ownerId,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      text: true,
      createdAt: true,
      task: {
        select: {
          id: true,
          title: true,
          projectId: true,
          project: {
            select: {
              name: true
            }
          }
        },
      },
    },
  });

  return recentComments;
}
