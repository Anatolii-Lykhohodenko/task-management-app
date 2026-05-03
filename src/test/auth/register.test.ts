import { describe, expect, it, vi } from 'vitest';
import { register } from '@/server/actions/auth';
import prisma from '@/lib/db/client';
import { signIn } from '@/auth';
import { rootRoute } from '@/lib/routes';

vi.mock('@/lib/db/client', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/auth', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  auth: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('cryptedPassword'),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not register an existent user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      name: 'Existing user',
      id: 1,
      email: 'existinguser@gmail.com',
      createdAt: new Date(),
      password: 'exitingUserPassword',
    });

    const formData = new FormData();

    formData.append('name', 'New user');
    formData.append('password', 'newUserPassword');
    formData.append('confirm-password', 'newUserPassword');
    formData.append('email', 'existinguser@gmail.com');

    const result = await register(null, formData);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'existinguser@gmail.com' },
    });
    expect(result).toEqual({ error: 'User already exists' });
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("should register new user and redirect to 'rootRoute' if callbackUrl was not specified ", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const formData = new FormData();

    formData.append('name', 'New user');
    formData.append('password', 'newUserPassword');
    formData.append('confirm-password', 'newUserPassword');
    formData.append('email', 'newuser@gmail.com');

    const result = await register(null, formData);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'newuser@gmail.com' },
    });
    expect(result).toEqual({ success: true });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'New user',
        password: 'cryptedPassword',
        email: 'newuser@gmail.com',
      },
    });
    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'newuser@gmail.com',
      password: 'newUserPassword',
      redirectTo: rootRoute,
    });
  });

  it("should register new user and redirect to callbackUrl if specified ", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const formData = new FormData();

    formData.append('name', 'New user');
    formData.append('password', 'newUserPassword');
    formData.append('confirm-password', 'newUserPassword');
    formData.append('email', 'newuser@gmail.com');
    formData.append('callbackUrl', '/tasks');

    const result = await register(null, formData);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'newuser@gmail.com' },
    });
    expect(result).toEqual({ success: true });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'New user',
        password: 'cryptedPassword',
        email: 'newuser@gmail.com',
      },
    });
    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'newuser@gmail.com',
      password: 'newUserPassword',
      redirectTo: '/tasks',
    });
  });
});
