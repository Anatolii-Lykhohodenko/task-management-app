import { describe, expect, it, vi } from 'vitest';
import prisma from '@/lib/db/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { deleteProject } from '@/server/actions/projects';
import { getCurrentUserId } from '@/lib/server/auth';

vi.mock('@/lib/db/client', () => ({
  default: {
    project: {
      delete: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/lib/server/auth', () => ({
  getCurrentUserId: vi.fn(),
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

describe('deleteProject', () => {
  it('should throw an error if projectId is invalid', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue('2');
    await expect(deleteProject({ id: 'abc' })).rejects.toThrow(
      'Project not found'
    );

    expect(prisma.project.delete).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
  it('should throw an error if user is unauthorized', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(null);
    await expect(deleteProject({ id: 'abc' })).rejects.toThrow(
      'Unauthorized'
    );

    expect(prisma.project.delete).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should throw an error if user does not own a project', async () => {
    vi.mocked(prisma.project.findFirst).mockResolvedValue(null);
    vi.mocked(getCurrentUserId).mockResolvedValue('2');

    await expect(deleteProject({ id: '1' })).rejects.toThrow('Project not found');

    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: { id: 1, ownerId: 2 }, select: { id: true }
    });
    expect(prisma.project.delete).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should correctly delete an existent project', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue('2');
    vi.mocked(prisma.project.findFirst).mockResolvedValue({
      id: 1,
      name: 'name',
      ownerId: 2,
      createdAt: new Date(),
    });

    await deleteProject({ id: '1' });

    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: { id: 1, ownerId: 2 },
      select: { id: true },
    });
    expect(prisma.project.delete).toHaveBeenCalledWith({
      where: { id: 1 }
    });
    expect(revalidatePath).toHaveBeenCalledWith('/projects');
    expect(redirect).toHaveBeenCalledWith('/projects', 'replace');
  });
});
