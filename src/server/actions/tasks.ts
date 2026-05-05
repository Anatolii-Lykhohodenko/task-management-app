'use server';

import prisma from '@/lib/db/client';
import { findTaskInProject } from '@/lib/db/queries';
import { taskSchema } from '@/schemas/task.schema';
import { ActionState } from '@/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTask(_prevState: ActionState, formData: FormData) {
  const projectId = Number(formData.get('projectId'));
  const ownerId = Number(formData.get('userId'));
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
  if (!ownerId || Number.isNaN(ownerId)) return { error: 'Unauthorized' };

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

  await prisma.task.create({
    data: {
      title,
      description,
      projectId: project.id,
      status,
      priority,
    },
  });

  revalidatePath(`/projects/${project.id}/tasks`);
  redirect(`/projects/${project.id}/tasks`);
}

export async function updateTask(_prevState: ActionState, formData: FormData) {
  const projectId = Number(formData.get('projectId'));
  const taskId = Number(formData.get('taskId'));
  const userId = Number(formData.get('userId'));

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
  if (!userId || Number.isNaN(userId)) return { error: 'Unauthorized' };

  const task = await findTaskInProject(taskId, projectId, userId, {
    id: true,
  });

  if (!task) return { error: 'Task not found' };

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

  revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
  redirect(`/projects/${projectId}/tasks/${taskId}`);
}

export async function deleteTask(
  projectId: number,
  taskId: number,
  userId: number
) {
  if (!projectId) {
    throw new Error('Project not found');
  }

  if (!taskId) {
    throw new Error('Task not found');
  }

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const task = await findTaskInProject(taskId, projectId, userId, {
    id: true,
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
