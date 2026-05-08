import { describe, expect, it, vi } from 'vitest';
import prisma from '@/lib/db/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createTask } from '@/server/actions/tasks';

vi.mock('@/lib/db/client', () => ({
  default: {
    task: {
      create: vi.fn(),
    },
    project: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('createTask', () => {
  it('should return an error if projectId is invalid', async () => {
    const formData = new FormData();
    formData.append('projectId', 'abc');
    formData.append('title', 'Created task');
    formData.append('status', 'OPEN');
    formData.append('priority', 'MEDIUM');
    formData.append('description', 'Created description');
    const result = await createTask(null, formData);

    expect(result).toEqual({ error: 'Project not found' });
    expect(prisma.task.create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should return an error if form data is invalid', async () => {
    const formData = new FormData();
    formData.append('projectId', '1');

    const result = await createTask(null, formData);

    expect(result).toHaveProperty('error');
    expect(prisma.task.create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should return an error if user is not authorized', async () => {
    const formData = new FormData();
    formData.append('projectId', '1');
    formData.append('userId', 'abc');
    formData.append('title', 'Created task');
    formData.append('status', 'OPEN');
    formData.append('priority', 'MEDIUM');
    formData.append('description', 'Created description');

    const result = await createTask(null, formData);

    expect(result).toEqual({ error: 'Unauthorized' });
    expect(prisma.task.create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should return an error if project does not exists', async () => {
    vi.mocked(prisma.project.findFirst).mockResolvedValue(null);
    const formData = new FormData();
    formData.append('projectId', '1');
    formData.append('userId', '2');
    formData.append('title', 'Created task');
    formData.append('status', 'OPEN');
    formData.append('priority', 'MEDIUM');
    formData.append('description', 'Created description');
    const result = await createTask(null, formData);

    expect(result).toEqual({ error: 'Project not found' });
    expect(prisma.task.create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should correctly create a task', async () => {
    vi.mocked(prisma.project.findFirst).mockResolvedValue({ id: 1 } as never);
    const formData = new FormData();
    formData.append('projectId', '1');
    formData.append('userId', '2');
    formData.append('title', 'Created task');
    formData.append('status', 'OPEN');
    formData.append('priority', 'MEDIUM');
    formData.append('description', 'Created description');

    await createTask(null, formData);
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        projectId: 1,
        title: 'Created task',
        status: 'OPEN',
        priority: 'MEDIUM',
        description: 'Created description',
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/projects/1/tasks');
    expect(redirect).toHaveBeenCalledWith('/projects/1/tasks');
  });
});
