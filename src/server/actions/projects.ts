'use server';

import prisma from '@/lib/db/client';
import { getCurrentUserId } from '@/lib/server/auth';
import { projectSchema } from '@/schemas/project.schema';
import { ActionState } from '@/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
  const userId = await getCurrentUserId();

  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const newProject = await prisma.project.create({
    data: {
      name,
      ownerId: +userId,
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

  const userId = await getCurrentUserId();

  if (!userId) {
    return { error: 'Unauthorized' };
  }

  await prisma.project.update({
    where: {
      id: projectId,
      ownerId: +userId,
    },
    data: {
      name,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function deleteProject(id: string, userId: string | null) {
  const projectId = Number(id);
  const ownerId = Number(userId);

  if (
    !projectId ||
    Number.isNaN(projectId) ||
    !ownerId ||
    Number.isNaN(ownerId)
  ) {
    throw new Error('Project not found');
  }

  const foundProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId,
    },
    select: {
      id: true,
    },
  });

  if (!foundProject) {
    throw new Error('Project not found');
  }

  await prisma.project.delete({
    where: {
      id: foundProject.id,
    },
  });

  revalidatePath('/projects');
  redirect('/projects', 'replace');
}
