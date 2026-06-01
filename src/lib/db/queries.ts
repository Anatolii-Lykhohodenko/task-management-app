import prisma from '@/lib/db/client';
import { getCurrentUserId } from '@/lib/server/auth';
import { SortByType } from '@/types';
import { Priority, Prisma, Status } from '@prisma/client';

export async function findTaskInProject<T extends Prisma.TaskSelect>({
  taskId,
  projectId,
  ownerId,
  select,
  deletedState = 'active',
}: {
  taskId: number;
  projectId: number;
  ownerId: number;
  select: T;
  deletedState?: 'active' | 'deleted' | 'all';
}) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
      project: {
        ownerId,
      },
      ...(deletedState === 'active'
        ? { deletedAt: null }
        : deletedState === 'deleted'
          ? { deletedAt: { not: null } }
          : {}),
    },
    select,
  });
}

export async function findAllDeletedTasks({
  projectId,
  assigneeId,
  take,
  search,
}: {
  projectId?: number;
  assigneeId?: number;
  take?: number;
  search?: string;
}) {
  const ownerId = await getCurrentUserId();

  if (!ownerId) {
    return { error: 'Unauthorized' };
  }

  try {
    const result = await prisma.task.findMany({
      where: {
        deletedAt: { not: null },
        project: {
          ownerId,
        },
        ...(search && {
          title: { contains: search, mode: 'insensitive' as Prisma.QueryMode },
        }),
        ...(assigneeId && { assigneeId }),
        ...(projectId && { projectId }),
      },
      ...(take && { take }),
      orderBy: { deletedAt: 'desc' },
      select: {
        id: true,
        title: true,
        projectId: true,
        priority: true,
        status: true,
        deletedAt: true,
        assignee: { select: { name: true } },
        logs: {
          where: {
            activityType: 'TASK_DELETED',
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            user: { select: { name: true } },
          },
        },
      },
    });

    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong';

    return { error: message };
  }
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

  const [projectsCount, tasksCount, byStatus, byPriority, overdue] =
    await Promise.all([
      prisma.project.count({ where: { ownerId } }),
      prisma.task.count({ where: { project: { ownerId }, deletedAt: null } }),
      prisma.task.groupBy({
        by: ['status'],
        where: { project: { ownerId }, deletedAt: null },
        _count: { status: true },
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where: { project: { ownerId }, deletedAt: null },
        _count: { priority: true },
      }),
      prisma.task.count({
        where: {
          deletedAt: null,
          project: { ownerId },
          dueDate: { lt: new Date() },
          status: { not: 'CLOSED' },
        },
      }),
    ]);

  return { projectsCount, tasksCount, byStatus, byPriority, overdue };
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
      deletedAt: null,
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
      task: {
        deletedAt: null,
      },
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
  overdue,
  assigneeId,
  sortBy = { createdAt: 'desc' },
}: {
  projectId: number;
  search: string | null;
  status?: Status | null;
  priority: Priority | null;
  sortBy: SortByType;
  overdue?: boolean;
  assigneeId?: number;
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
      ...(status && !overdue && { status }),
      ...(assigneeId && { assigneeId }),
      ...(overdue && {
        dueDate: { lt: new Date() },
        status: { not: 'CLOSED' as Status },
      }),
      ...(search && {
        title: { contains: search, mode: 'insensitive' as Prisma.QueryMode },
      }),
      deletedAt: null,
    },
    orderBy: sortBy,
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      assignee: {
        select: {
          name: true,
        },
      },
      dueDate: true,
    },
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

export async function findAssignee(assigneeId: number) {
  const assignee = await prisma.user.findUnique({
    where: {
      id: assigneeId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return assignee;
}

export async function getActivityLogs({ taskId }: { taskId: number }) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const logs = await prisma.activityLog.findMany({
    where: {
      taskId,
    },
    select: {
      id: true,
      payload: true,
      activityType: true,
      createdAt: true,
      user: {
        select: {
          name: true,
        },
      },
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  return logs.reverse();
}
