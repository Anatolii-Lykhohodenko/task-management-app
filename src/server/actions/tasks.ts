'use server';

import prisma from '@/lib/db/client';
import { findTaskInProject } from '@/lib/db/queries';
import { getCurrentUserId } from '@/lib/server/auth';
import { taskSchema } from '@/schemas/task.schema';
import { ActionState } from '@/types';
import { Status, Priority } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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

  const { title, status, priority, description } = result.data;

  try {
    await prisma.task.create({
      data: {
        title,
        description,
        projectId: project.id,
        status,
        priority,
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
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid form data' };
  }

  const { title, status, priority, description } = result.data;

  if (!projectId || Number.isNaN(projectId))
    return { error: 'Project not found' };
  if (!taskId || Number.isNaN(taskId)) return { error: 'Task not found' };

  const task = await findTaskInProject({
    taskId,
    projectId,
    ownerId,
    select: {
      id: true,
    },
  });

  if (!task) return { error: 'Task not found' };

  try {
    await prisma.task.update({
      where: {
        id: task.id,
      },
      data: {
        title,
        description,
        status,
        priority,
      },
    });
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
    },
  });

  if (!task) return { error: 'Task not found' };

  try {
    await prisma.task.update({
      where: {
        id: task.id,
      },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    return { error: message };
  }
  revalidatePath(`/projects/${projectId}/tasks`);
}

export async function updateTaskStatus({ projectId, taskId, status} : { projectId: number, taskId: number, status: Status}) {
  const ownerId = await getCurrentUserId()

  if (!ownerId) {
    throw new Error('Unauthorized');
  }

  const task = await findTaskInProject({ taskId, projectId, ownerId, select: { id: true }});

  if (!task) {
    throw new Error('Task not found')
  }

  await prisma.task.update({
    where: {
      id: task.id
    },
    data: {
      status
    }
  })

  revalidatePath(`/projects/${projectId}/board`);
}