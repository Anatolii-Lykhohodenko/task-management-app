'use server';

import prisma from '@/lib/db/client';
import { loginSchema, registerSchema } from '@/schemas/auth.schema';
import { ActionState } from '@/types';
import { hash } from 'bcryptjs';
import { signIn, signOut } from '@/auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { getSafeCallbackUrl } from '@/lib/routes';

export async function register(_state: ActionState, formData: FormData) {
  const result = registerSchema.safeParse({
    name: formData.get('name'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirm-password'),
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

  const cryptedPassword = await hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      password: cryptedPassword,
      email,
    },
  });

  const callbackUrl = getSafeCallbackUrl(
    formData.get('callbackUrl')?.toString()
  );

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: 'Wrong credentials' };
  }

  return { success: true };
}

export async function login(_state: ActionState | null, formData: FormData) {
  const result = loginSchema.safeParse({
    password: formData.get('password'),
    email: formData.get('email'),
  });

  if (!result.success) {
    return { error: result.error.issues[0].message || 'Invalid form data' };
  }

  const { email, password } = result.data;
  const callbackUrl = getSafeCallbackUrl(
    formData.get('callbackUrl')?.toString()
  );

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: 'Wrong credentials' };
  }

  return { success: true };
}

export async function signOutAction() {
  await signOut({ redirectTo: '/auth/login' });
}
