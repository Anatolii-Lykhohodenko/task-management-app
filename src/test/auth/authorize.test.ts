import { describe, expect, it, vi } from 'vitest';
import prisma from '@/lib/db/client';
import authorize from '@/lib/server/authorize';
import { compare } from 'bcryptjs';

vi.mock('@/lib/db/client', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/auth', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  auth: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('authorize', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null if credentials are invalid', async () => {
    const result = await authorize({});

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(result).toBe(null);
    expect(compare).not.toHaveBeenCalled();
  });

  it('should return null if email is not found', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const result = await authorize({
      email: 'someEmail@gmail.com',
      password: 'somePassword',
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'someEmail@gmail.com' },
    });
    expect(result).toBe(null);
    expect(compare).not.toHaveBeenCalled();
  });

  it('should return null if email is found and password is incorrect', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      name: 'foundUser',
      id: 1,
      email: 'someEmail@gmail.com',
      createdAt: new Date(),
      password: 'hashedPassword',
    });

    vi.mocked(compare).mockResolvedValue(false as never);

    const result = await authorize({
      email: 'someEmail@gmail.com',
      password: 'somePassword',
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'someEmail@gmail.com' },
    });
    expect(result).toBe(null);
    expect(compare).toHaveBeenCalledWith('somePassword', 'hashedPassword');
  });

  it('should return user data if email is found and password is correct', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      name: 'foundUser',
      id: 1,
      email: 'someEmail@gmail.com',
      createdAt: new Date(),
      password: 'hashedPassword',
    });

    vi.mocked(compare).mockResolvedValue(true as never)

    const result = await authorize({
      email: 'someEmail@gmail.com',
      password: 'hashedPassword',
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'someEmail@gmail.com' },
    });
    expect(compare).toHaveBeenCalledWith('hashedPassword', 'hashedPassword');
    expect(result).toEqual({
      id: '1',
      email: 'someEmail@gmail.com',
      name: 'foundUser',
    });
  });
});
