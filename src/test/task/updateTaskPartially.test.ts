import { describe, expect, it, vi } from 'vitest';
import { updateTaskPartially } from '@/server/actions/tasks';
import prisma from '@/lib/db/client';
import { findTaskInProject } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@/lib/server/auth';

vi.mock('@/lib/db/client', () => ({
  default: {
    task: {
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

vi.mock('@/lib/server/auth', () => ({
  getCurrentUserId: vi.fn(),
}));

describe('updateTaskPartially', () => {
  it('should return an error if user is unauthorized', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(null);

    const result = await updateTaskPartially({
      taskId: 1,
      projectId: 2,
      status: 'OPEN',
    });

    expect(result).toEqual({ error: 'Unauthorized' });
    expect(findTaskInProject).not.toHaveBeenCalled();
    expect(prisma.task.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('should return and stop execution if no status and priority provided', async () => {
    const result = await updateTaskPartially({ taskId: 1, projectId: 2 });

    expect(result).toBeUndefined();
    expect(getCurrentUserId).not.toHaveBeenCalled();
    expect(findTaskInProject).not.toHaveBeenCalled();
    expect(prisma.task.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('should return an error if task does not exist', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(findTaskInProject).mockResolvedValue(null);
    const result = await updateTaskPartially({ taskId: 1, projectId: 2, status: 'OPEN' });

    expect(result).toEqual({ error: 'Task not found' });
    expect(prisma.task.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('should correctly update if only status is provided', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(findTaskInProject).mockResolvedValue({ id: 1 } as never);
    await updateTaskPartially({ taskId: 1, projectId: 2, status: 'OPEN' });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        status: 'OPEN'
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith(`/projects/2/tasks`);
  });

  it('should correctly update if only priority is provided', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(findTaskInProject).mockResolvedValue({ id: 1 } as never);
    await updateTaskPartially({ taskId: 1, projectId: 2, priority: 'HIGH' });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        priority: 'HIGH',
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith(`/projects/2/tasks`);
  });

  it('should correctly update if status and priority are provided', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(findTaskInProject).mockResolvedValue({ id: 1 } as never);
    await updateTaskPartially({
      taskId: 1,
      projectId: 2,
      priority: 'HIGH',
      status: 'OPEN',
    });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        priority: 'HIGH',
        status: 'OPEN',
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith(`/projects/2/tasks`);
  });

  it('should return an error if prisma throws error', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(findTaskInProject).mockResolvedValue({ id: 1 } as never);
    vi.mocked(prisma.task.update).mockRejectedValue(new Error('DB error'));
  
    const result = await updateTaskPartially({
      taskId: 1,
      projectId: 2,
      priority: 'HIGH',
      status: 'OPEN',
    });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        priority: 'HIGH',
        status: 'OPEN',
      },
    });

    expect(result).toEqual({ error: 'DB error'})
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
