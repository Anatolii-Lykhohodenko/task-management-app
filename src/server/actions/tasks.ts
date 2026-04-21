'use server';

import prisma from '@/lib/db/client';
import { ActionState } from '@/types';
import { Status, Priority } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTask(prevState: ActionState, formData: FormData) {
  const projectId = Number(formData.get('projectId'));
  const title = formData.get('title') as string;
  const status = formData.get('status') as Status;
  const priority = formData.get('priority') as Priority;
  const description = formData.get('description') as string;

  if (!title) return { error: 'Title is required' };
  if (!projectId) return { error: 'Project not found' };

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

export async function updateTask(prevState: ActionState, formData: FormData) {
  const projectId = Number(formData.get('projectId'));
  const taskId = Number(formData.get('taskId'));
  const title = formData.get('title') as string;
  const status = formData.get('status') as Status;
  const priority = formData.get('priority') as Priority;
  const description = formData.get('description') as string;

  if (!title) return { error: 'Title is required' };
  if (!projectId) return { error: 'Project not found' };
  if (!taskId) return { error: 'Task not found' };

  await prisma.task.update({
    where: {
      id: +taskId,
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

export async function deleteTask(projectId: string, taskId: string ) {
  await prisma.task.delete({
    where: {
      id: +taskId
    }
  })

  revalidatePath(`/projects/${projectId}/tasks`)
  redirect(`/projects/${projectId}/tasks`);
}
