import { describe, expect, it, vi } from 'vitest';
import prisma from '@/lib/db/client';
import { findTaskInProject } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { deleteTask } from '@/server/actions/tasks';

vi.mock('@/lib/db/client', () => ({
  default: {
    task: {
      delete: vi.fn(),
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

describe('deleteTask', () => {
  it('should correctly delete an existent task', async () => {
    vi.mocked(findTaskInProject).mockResolvedValue({ id: 1 } as never);
    await deleteTask({ projectId: 1, taskId: 2, userId: 3 });

    expect(findTaskInProject).toHaveBeenCalledWith({
      taskId: 2,
      projectId: 1,
      ownerId: 3,
      select: { id: true },
    });
    expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(revalidatePath).toHaveBeenCalledWith('/projects/1/tasks');
    expect(redirect).toHaveBeenCalledWith('/projects/1/tasks', 'replace');
  });

  it('should throw an error if task does not exist', async () => {
    vi.mocked(findTaskInProject).mockResolvedValue(null);

    await expect(deleteTask({ projectId: 1, taskId: 2, userId: 3 })).rejects.toThrow('Task not found');

    expect(prisma.task.delete).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
