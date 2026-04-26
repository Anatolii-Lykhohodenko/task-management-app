import { describe, expect, it, vi } from 'vitest';
import { updateTask } from '@/server/actions/tasks';
import prisma from '@/lib/db/client';
import { findTaskInProject } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('updateTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return an error if projectId is invalid', async () => {
    const formData = new FormData();
    formData.append('projectId', 'abc');
    formData.append('taskId', '2');
    formData.append('title', 'Updated task');
    formData.append('status', 'OPEN');
    formData.append('priority', 'MEDIUM');
    formData.append('description', 'Updated description');
    const result = await updateTask(null, formData);
  
    expect(findTaskInProject).not.toHaveBeenCalled();
    expect(prisma.task.update).not.toHaveBeenCalled();
    expect(result).toEqual({ error: 'Project not found' });
  });

  it('should return an error if taskId is invalid', async () => {
    const formData = new FormData();
    formData.append('projectId', '2');
    formData.append('taskId', 'abc');
    formData.append('title', 'Updated task');
    formData.append('status', 'OPEN');
    formData.append('priority', 'MEDIUM');
    formData.append('description', 'Updated description');
    const result = await updateTask(null, formData);

    expect(findTaskInProject).not.toHaveBeenCalled();
    expect(prisma.task.update).not.toHaveBeenCalled();
    expect(result).toEqual({ error: 'Task not found' });
  });

  it('should correctly update an existent task', async () => {
    vi.mocked(findTaskInProject).mockResolvedValue({ id: 1 });

    const formData = new FormData();
    formData.append('projectId', '2');
    formData.append('taskId', '1');
    formData.append('title', 'Updated task');
    formData.append('status', 'OPEN');
    formData.append('priority', 'MEDIUM');
    formData.append('description', 'Updated description');
    await updateTask(null, formData);

    expect(findTaskInProject).toHaveBeenCalledWith(1, 2, { id: true });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        title: 'Updated task',
        status: 'OPEN',
        priority: 'MEDIUM',
        description: 'Updated description',
      },
    });

    expect(revalidatePath).toHaveBeenCalledWith('/projects/2/tasks/1');
    expect(redirect).toHaveBeenCalledWith('/projects/2/tasks/1');
  });

  it('should return an error if task does not exist', async () => {
    vi.mocked(findTaskInProject).mockResolvedValue(null);

    const formData = new FormData();
    formData.append('projectId', '2');
    formData.append('taskId', '1');
    formData.append('title', 'Updated task');
    formData.append('status', 'OPEN');
    formData.append('priority', 'MEDIUM');
    formData.append('description', 'Updated description');
    const result = await updateTask(null, formData);

    expect(result).toEqual({ error: 'Task not found' });
    expect(prisma.task.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
