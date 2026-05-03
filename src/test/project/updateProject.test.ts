import prisma from '@/lib/db/client';
import { getCurrentUserId } from '@/lib/server/auth';
import { updateProject } from '@/server/actions/projects';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/db/client', () => ({
  default: {
    project: {
      update: vi.fn(),
    },
  },
}));
vi.mock('@/lib/db/queries', () => ({
  findTaskInProject: vi.fn(),
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

describe('updateProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return an error if projectId is invalid', async () => {
    const formData = new FormData();
    formData.append('projectId', 'abc');
    formData.append('name', 'abcd');
    const result = await updateProject(null, formData);

    expect(prisma.project.update).not.toHaveBeenCalled();
    expect(result).toEqual({ error: 'Project not found' });
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should correctly update an existent project', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue('1');
    const formData = new FormData();
    formData.append('projectId', '1');
    formData.append('name', 'abc');
    await updateProject(null, formData);

    expect(prisma.project.update).toHaveBeenCalledWith({
      where: {
        id: 1,
        ownerId: 1,
      },
      data: {
        name: 'abc',
      },
    });

    expect(revalidatePath).toHaveBeenCalledWith('/projects/1');
    expect(redirect).toHaveBeenCalledWith('/projects/1');
  });
});
