import { describe, expect, it, vi } from 'vitest';
import prisma from '@/lib/db/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createProject } from '@/server/actions/projects';
import { getCurrentUserId } from '@/lib/server/auth';

vi.mock('@/lib/db/client', () => ({
  default: {
    project: {
      create: vi.fn(),
    },
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/lib/utils', () => ({
  getCurrentUserId: vi.fn(),
}));

describe('createProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return an error if form data is invalid', async () => {
    const formData = new FormData();

    const result = await createProject(null, formData);

    expect(result).toHaveProperty('error');
    expect(prisma.project.create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should correctly create a project', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue('1');
    vi.mocked(prisma.project.create).mockResolvedValue({
      name: 'abc',
      ownerId: 1,
      id: 1,
      createdAt: new Date(),
    });
    const formData = new FormData();
    formData.append('name', 'abc');
    await createProject(null, formData);

    expect(prisma.project.create).toHaveBeenCalledWith({
      data: {
        name: 'abc',
        ownerId: 1,
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/projects/1');
    expect(redirect).toHaveBeenCalledWith('/projects/1');
  });
});
