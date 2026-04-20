'use server'

import prisma from '@/lib/db/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

type ActionState = {
  error?: string,
  success?: boolean
} | null

export async function createProject(prevState: ActionState, formData: FormData) {
  const name = formData.get('name') as string; 
  if (!name) return { error: 'Name is required' };

  await prisma.project.create({
    data: {
      name,
      ownerId: 1,
    },
  });

    revalidatePath('/projects');
    redirect('/projects');
}