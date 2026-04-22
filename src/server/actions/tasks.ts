'use server';

import prisma from '@/lib/db/client';
import { taskSchema } from '@/schemas/task.schema';
import { ActionState } from '@/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTask(_prevState: ActionState, formData: FormData) {
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

  const { title, status, priority, description } = result.data;

  await prisma.task.create({
    data: {
      title,
      description,
      projectId,
      status,
      priority,
    },
  });

  revalidatePath(`/projects/${projectId}/tasks`);
  redirect(`/projects/${projectId}/tasks`);
}

export async function updateTask(_prevState: ActionState, formData: FormData) {
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

  await prisma.task.update({
    where: {
      id: taskId,
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

export async function deleteTask(projectId: string, taskId: string) {
  const numericProjectId = Number(projectId);
  const numericTaskId = Number(taskId);
  if (!projectId || Number.isNaN(numericProjectId))
    return { error: 'Project not found' };
  if (!taskId || Number.isNaN(numericTaskId))
    return { error: 'Task not found' };

  await prisma.task.delete({
    where: {
      id: numericTaskId,
    },
  });

  revalidatePath(`/projects/${numericProjectId}/tasks`);
  redirect(`/projects/${numericProjectId}/tasks`);
}
