import prisma from '@/lib/db/client';
import { getCurrentUserId } from '@/lib/server/auth';
import { Priority, Prisma, Status } from '@prisma/client';

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
  const ownerId = await getCurrentUserId();

  if (!ownerId) {
    return { error: 'Unauthorized' };
  }

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
  const ownerId = await getCurrentUserId();

  if (!ownerId) {
    return { error: 'Unauthorized' };
  }

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

  const recentComments = await prisma.comment.findMany({
    where: {
      userId,
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
              name: true,
            },
          },
        },
      },
    },
  });

  return recentComments;
}

export async function getTasks({
  projectId,
  search,
  status,
  priority,
  sortBy = 'desc',
}: {
  projectId: number;
  search: string | null;
  status?: Status | null;
  priority: Priority | null;
  sortBy: 'desc' | 'asc';
}) {
  const ownerId = await getCurrentUserId();

  if (!ownerId) {
    return { error: 'Unauthorized' };
  }

  const query = {
    where: {
      project: {
        ownerId,
      },
      projectId,
      ...(priority && { priority }),
      ...(status && { status }),
      ...(search && {
        title: { contains: search, mode: 'insensitive' as Prisma.QueryMode },
      }),
    },
    orderBy: { createdAt: sortBy },
    select: { id: true, title: true, status: true, priority: true },
  };
  const tasks = await prisma.task.findMany(query);

  return tasks;
}

export async function getAssignees({ projectId }: { projectId: number }) {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const assignees = await prisma.user.findMany({
    where: {
      // add user-project relation in future
    },
    select: {
      id: true,
      name: true,
    },
  });

  return assignees;
}

export async function assigneeExists(assigneeId: number) {
  const assignee = await prisma.user.findUnique({
    where: {
      id: assigneeId,
    },
    select: {
      id: true,
    },
  });

  return !!assignee;
}
