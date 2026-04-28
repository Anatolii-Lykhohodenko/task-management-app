'use server';

import prisma from '@/lib/db/client';
import { loginSchema, registerSchema } from '@/schemas/auth.schema';
import { ActionState } from '@/types';
import bcrypt from 'bcryptjs';
import { signIn } from '@/auth';

export async function register(_state: ActionState, formData: FormData) {
  const result = registerSchema.safeParse({
    name: formData.get('name'),
    password: formData.get('password'),
    email: formData.get('email'),
  });

  if (!result.success) {
    return { error: result.error.issues[0].message || 'Invalid form data' };
  }

  const { email, password, name } = result.data;

  const isUserExist = await prisma.user.findUnique({ where: { email } });

  if (isUserExist) {
    return { error: 'User already exists' };
  }

  const cryptedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      password: cryptedPassword,
      email,
    },
  });

  await signIn('credentials', {
    email,
    password,
    redirectTo: '/projects',
  });
}

export async function login(_state: ActionState, formData: FormData) {
  const result = loginSchema.safeParse({
    password: formData.get('password'),
    email: formData.get('email'),
  });

  if (!result.success) {
    return { error: result.error.issues[0].message || 'Invalid form data' };
  }

  const { email, password } = result.data;

  await signIn('credentials', {
    email,
    password,
    redirectTo: '/projects',
  });
}
