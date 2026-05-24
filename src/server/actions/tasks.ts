'use server';

import prisma from '@/lib/db/client';
import { assigneeExists, findTaskInProject } from '@/lib/db/queries';
import { getCurrentUserId } from '@/lib/server/auth';
import { taskSchema } from '@/schemas/task.schema';
import { ActionState } from '@/types';
import { Status, Priority, ActivityType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function parseAssigneeId(value: string) {
  const parsed = Number(value);
  return parsed > 0 ? parsed : null;
}

export async function createTask(_prevState: ActionState, formData: FormData) {
  const ownerId = await getCurrentUserId();

  if (!ownerId) {
    return { error: 'Unauthorized' };
  }

  const projectId = Number(formData.get('projectId'));
  const result = taskSchema.safeParse({
    title: formData.get('title'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    description: formData.get('description'),
    assigneeId: formData.get('assigneeId'),
    dueDate: formData.get('dueDate'),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid form data' };
  }

  if (!projectId || Number.isNaN(projectId))
    return { error: 'Project not found' };

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId,
    },
    select: {
      id: true,
    },
  });

  if (!project) return { error: 'Project not found' };

  const { title, status, priority, description, assigneeId, dueDate } =
    result.data;

  const preparedAssigneeId = parseAssigneeId(assigneeId);

  if (preparedAssigneeId) {
    const isAssigneeExist = await assigneeExists(preparedAssigneeId);
    if (!isAssigneeExist) return { error: 'Assignee not found' };
  }

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId: project.id,
        assigneeId: preparedAssigneeId,
        dueDate: dueDate ?? null,
        status,
        priority,
      },
      select: {
        id: true,
      },
    });
    await prisma.activityLog.create({
      data: {
        taskId: task.id,
        userId: ownerId,
        activityType: 'TASK_CREATED',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    return { error: message };
  }

  revalidatePath(`/projects/${project.id}/tasks`);
  redirect(`/projects/${project.id}/tasks`);
}

export async function updateTask(_prevState: ActionState, formData: FormData) {
  const ownerId = await getCurrentUserId();

  if (!ownerId) {
    return { error: 'Unauthorized' };
  }

  const projectId = Number(formData.get('projectId'));
  const taskId = Number(formData.get('taskId'));

  const result = taskSchema.safeParse({
    title: formData.get('title'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    description: formData.get('description'),
    assigneeId: formData.get('assigneeId'),
    dueDate: formData.get('dueDate'),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid form data' };
  }

  const { title, status, priority, description, assigneeId, dueDate } =
    result.data;

  const preparedAssigneeId = parseAssigneeId(assigneeId);

  if (preparedAssigneeId) {
    const isAssigneeExist = await assigneeExists(preparedAssigneeId);
    if (!isAssigneeExist) return { error: 'Assignee not found' };
  }

  if (!projectId || Number.isNaN(projectId))
    return { error: 'Project not found' };
  if (!taskId || Number.isNaN(taskId)) return { error: 'Task not found' };

  const task = await findTaskInProject({
    taskId,
    projectId,
    ownerId,
    select: {
      id: true,
      status: true,
      assigneeId: true,
      priority: true,
      dueDate: true,
    },
  });
  const newValues = {
    status,
    priority,
    assigneeId: preparedAssigneeId,
  };
  const changes = [];

  if (!task) return { error: 'Task not found' };

  const trackedKeys = ['status', 'priority', 'dueDate', 'assigneeId'] as const;

  for (const property of trackedKeys) {
    switch (property) {
      case 'dueDate': {
        if (task[property]?.toDateString() !== dueDate?.toDateString()) {
          changes.push({
            action: ActivityType.DUE_DATE_CHANGED,
            payload: {
              from: task[property]?.toDateString(),
              to: dueDate?.toDateString(),
            },
          });
        }
        break;
      }
      case 'status':
      case 'priority':
      case 'assigneeId': {
        if (task[property] !== newValues[property]) {
          const action =
            property === 'status'
              ? ActivityType.STATUS_CHANGED
              : property === 'priority'
                ? ActivityType.PRIORITY_CHANGED
                : ActivityType.ASSIGNEE_CHANGED;
          changes.push({
            action,
            payload: { from: task[property], to: newValues[property] },
          });
        }
        break;
      }

      default: {
        break;
      }
    }
  }

  try {
    const promises = changes.map((change) =>
      prisma.activityLog.create({
        data: {
          taskId: task.id,
          userId: ownerId,
          activityType: change.action,
          ...(change.payload && { payload: change.payload }),
        },
      })
    );
    await Promise.all([
      prisma.task.update({
        where: {
          id: task.id,
        },
        data: {
          title,
          description,
          dueDate: dueDate ?? null,
          assigneeId: preparedAssigneeId,
          status,
          priority,
        },
      }),
      ...promises,
    ]);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    return { error: message };
  }

  revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
  redirect(`/projects/${projectId}/tasks/${taskId}`);
}

export async function deleteTask({
  projectId,
  taskId,
}: {
  projectId: number;
  taskId: number;
}) {
  if (!projectId) {
    throw new Error('Project not found');
  }

  if (!taskId) {
    throw new Error('Task not found');
  }

  const ownerId = await getCurrentUserId();

  if (!ownerId) {
    throw new Error('Unauthorized');
  }

  const task = await findTaskInProject({
    taskId,
    projectId,
    ownerId,
    select: {
      id: true,
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  await prisma.task.delete({
    where: {
      id: task.id,
    },
  });

  revalidatePath(`/projects/${projectId}/tasks`);
  redirect(`/projects/${projectId}/tasks`, 'replace');
}

export async function updateTaskPartially({
  projectId,
  taskId,
  status,
  priority,
}: {
  projectId: number;
  taskId: number;
  status?: Status;
  priority?: Priority;
}) {
  if (!status && !priority) {
    return;
  }
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const task = await findTaskInProject({
    taskId,
    projectId,
    ownerId: userId,
    select: {
      id: true,
      status: true,
      priority: true,
    },
  });

  if (!task) return { error: 'Task not found' };

  const newValues = {
    status,
    priority,
  };
  const changes = [];
  
  const trackedKeys = ['status', 'priority'] as const;

  for (const property of trackedKeys) {
    switch (property) {
      case 'status':
      case 'priority': {
        if (task[property] !== newValues[property] && newValues[property]) {
          const action =
            property === 'status'
              ? ActivityType.STATUS_CHANGED
              : property === 'priority'
                ? ActivityType.PRIORITY_CHANGED
                : ActivityType.ASSIGNEE_CHANGED;
          changes.push({
            action,
            payload: { from: task[property], to: newValues[property] },
          });
        }
        break;
      }

      default: {
        break;
      }
    }
  }

  try {
    const promises = changes.map((change) =>
      prisma.activityLog.create({
        data: {
          taskId: task.id,
          userId,
          activityType: change.action,
          ...(change.payload && { payload: change.payload }),
        },
      })
    );
    await Promise.all([
      prisma.task.update({
        where: {
          id: task.id,
        },
        data: {
          ...(status && { status }),
          ...(priority && { priority }),
        },
      }),
      ...promises,
    ]);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    return { error: message };
  }
  revalidatePath(`/projects/${projectId}/tasks`);
}

export async function updateTaskStatus({
  projectId,
  taskId,
  status,
}: {
  projectId: number;
  taskId: number;
  status: Status;
}) {
  const ownerId = await getCurrentUserId();

  if (!ownerId) {
    throw new Error('Unauthorized');
  }

  const task = await findTaskInProject({
    taskId,
    projectId,
    ownerId,
    select: { id: true, status: true },
  });

  if (!task) {
    throw new Error('Task not found');
  }
  try {
    await Promise.all([
      prisma.task.update({
        where: {
          id: task.id,
        },
        data: {
          status,
        },
      }),
      prisma.activityLog.create({
        data: {
          taskId: task.id,
          userId: ownerId,
          activityType: 'STATUS_CHANGED',
          payload: { from: task.status, to: status },
        },
      }),
    ]);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    throw new Error(message);
  }

  revalidatePath(`/projects/${projectId}/board`);
}
