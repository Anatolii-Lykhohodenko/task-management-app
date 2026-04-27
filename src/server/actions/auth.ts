import prisma from '@/lib/db/client';
import { loginSchema, registerSchema } from '@/schemas/auth.schema';
import { ActionState } from '@/types';
import bcrypt from 'bcryptjs';

export async function register(state: ActionState, formData: FormData) {
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
    select: {
      name: true,
      email: true,
    },
  });

  return { success: true };
}

export async function login(state: ActionState, formData: FormData) {
  const result = loginSchema.safeParse({
    password: formData.get('password'),
    email: formData.get('email'),
  });

  if (!result.success) {
    return { error: result.error.issues[0].message || 'Invalid form data' };
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      password: true,
    },
  });

  if (!user) {
    return { error: 'Invalid credentials' };
  }

  const isCorrectPassword = await bcrypt.compare(password, user.password);

  if (!isCorrectPassword) {
    return { error: 'Invalid credentials' };
  }

  return { success: true };
}
