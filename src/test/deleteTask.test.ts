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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error if projectId is invalid', async () => {
    await expect(deleteTask('null', '2')).rejects.toThrow('Project not found');

    expect(findTaskInProject).not.toHaveBeenCalled();
    expect(prisma.task.delete).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should throw an error if taskId is invalid', async () => {
    await expect(deleteTask('1', 'null')).rejects.toThrow('Task not found');

    expect(findTaskInProject).not.toHaveBeenCalled();
    expect(prisma.task.delete).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should correctly delete an existent task', async () => {
    vi.mocked(findTaskInProject).mockResolvedValue({ id: 1 });
    await deleteTask('1', '2');

    
    expect(findTaskInProject).toHaveBeenCalledWith(2, 1, { id: true });
    expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 1 }});
    expect(revalidatePath).toHaveBeenCalledWith('/projects/1/tasks');
    expect(redirect).toHaveBeenCalledWith('/projects/1/tasks', 'replace');
  });

  it('should throw an error if task does not exist', async () => {
    vi.mocked(findTaskInProject).mockResolvedValue(null);

    await expect(deleteTask('1', '2')).rejects.toThrow('Task not found');

    expect(prisma.task.delete).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
