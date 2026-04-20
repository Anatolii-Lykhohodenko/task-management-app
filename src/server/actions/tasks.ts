'use server'

import prisma from '@/lib/db/client';
import { Status, Priority } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

type ActionState = {
  error?: string,
  success?: boolean
} | null

export async function createTask(prevState: ActionState, formData: FormData) {
  const projectId = Number(formData.get('projectId'))
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
      priority
    }
  })

  revalidatePath(`/projects/${projectId}/tasks`)
  redirect(`/projects/${projectId}/tasks`);
}