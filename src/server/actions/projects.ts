'use server';

import prisma from '@/lib/db/client';
import { createProjectSchema } from '@/schemas/project.schema';
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
  const result = createProjectSchema.safeParse({
    name: formData.get('name'),
  });
  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? 'Invalid form data',
    };
  }
  const { name } = result.data;

  await prisma.project.create({
    data: {
      name,
      ownerId: 1,
    },
  });

  revalidatePath('/projects');
  redirect('/projects');
}
