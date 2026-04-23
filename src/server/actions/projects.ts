'use server';

import prisma from '@/lib/db/client';
import { getCurrentUserId } from '@/lib/utils';
import { projectSchema } from '@/schemas/project.schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

type ActionState = {
  error?: string;
  success?: boolean;
} | null;

export async function createProject(
  _prevState: ActionState,
  formData: FormData
) {
  const result = projectSchema.safeParse({
    name: formData.get('name'),
  });
  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? 'Invalid form data',
    };
  }
  const { name } = result.data;

  const newProject = await prisma.project.create({
    data: {
      name,
      ownerId: getCurrentUserId(),
    },
  });

  revalidatePath(`/projects/${newProject.id}`);
  redirect(`/projects/${newProject.id}`);
}

export async function updateProject(
  _prevState: ActionState,
  formData: FormData
) {
  const projectId = Number(formData.get('projectId'));

  if (!projectId || Number.isNaN(projectId))
    return { error: 'Project not found' };

  const result = projectSchema.safeParse({
    name: formData.get('name'),
  });
  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? 'Invalid form data',
    };
  }
  const { name } = result.data;

  await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      name,
      ownerId: getCurrentUserId(),
    },
  });

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function deleteProject(id : string) {
  const projectId = Number(id);

  if (!projectId || Number.isNaN(projectId))
    throw new Error('Project not found');

  await prisma.project.delete({
    where: {
      id: projectId,
    }
  });

  revalidatePath('/projects');
  redirect('/projects');
}
