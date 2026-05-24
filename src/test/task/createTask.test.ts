import { describe, expect, it, vi } from 'vitest';
import prisma from '@/lib/db/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createTask } from '@/server/actions/tasks';
import { getCurrentUserId } from '@/lib/server/auth';
import { assigneeExists } from '@/lib/db/queries';

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

vi.mock('@/lib/server/auth', () => ({
  getCurrentUserId: vi.fn(),
}));

vi.mock('@/lib/db/queries', () => ({
  assigneeExists: vi.fn(),
}));

describe('createTask', () => {
  it('should return an error if projectId is invalid', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(assigneeExists).mockResolvedValue(true);
    const formData = new FormData();
    formData.append('projectId', 'abc');
    formData.append('title', 'Created task');
    formData.append('assigneeId', '5');
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
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    const formData = new FormData();
    formData.append('projectId', '1');

    const result = await createTask(null, formData);

    expect(result).toHaveProperty('error');
    expect(prisma.task.create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should return an error if user is not authorized', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(null);
    const formData = new FormData();
    formData.append('projectId', '1');
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

  it('should return an error if assignee does not exist', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(2);
    vi.mocked(assigneeExists).mockResolvedValue(false);
    vi.mocked(prisma.project.findFirst).mockResolvedValue({ id: 1 } as never);
    const formData = new FormData();
    formData.append('projectId', '1');
    formData.append('title', 'Created task');
    formData.append('status', 'OPEN');
    formData.append('priority', 'MEDIUM');
    formData.append('assigneeId', '5');
    formData.append('description', 'Created description');
    const result = await createTask(null, formData);

    expect(result).toEqual({ error: 'Assignee not found' });
    expect(prisma.task.create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should correctly create a task', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(assigneeExists).mockResolvedValue(true);
    vi.mocked(prisma.project.findFirst).mockResolvedValue({ id: 1 } as never);
    const formData = new FormData();
    formData.append('projectId', '1');
    formData.append('title', 'Created task');
    formData.append('status', 'OPEN');
    formData.append('assigneeId', '5');
    formData.append('dueDate', '2026-06-01');
    formData.append('priority', 'MEDIUM');
    formData.append('description', 'Created description');

    await createTask(null, formData);
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        assigneeId: 5,
        projectId: 1,
        title: 'Created task',
        status: 'OPEN',
        priority: 'MEDIUM',
        dueDate: new Date('2026-06-01'),
        description: 'Created description',
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/projects/1/tasks');
    expect(redirect).toHaveBeenCalledWith('/projects/1/tasks');
  });

  it('should correctly create a task without dueDate', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(assigneeExists).mockResolvedValue(true);
    vi.mocked(prisma.project.findFirst).mockResolvedValue({ id: 1 } as never);
    const formData = new FormData();
    formData.append('projectId', '1');
    formData.append('title', 'Created task');
    formData.append('status', 'OPEN');
    formData.append('assigneeId', '5');
    formData.append('dueDate', '');
    formData.append('priority', 'MEDIUM');
    formData.append('description', 'Created description');

    await createTask(null, formData);
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        assigneeId: 5,
        projectId: 1,
        title: 'Created task',
        status: 'OPEN',
        priority: 'MEDIUM',
        dueDate: null,
        description: 'Created description',
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/projects/1/tasks');
    expect(redirect).toHaveBeenCalledWith('/projects/1/tasks');
  });

  it('should correctly create a task without assignee', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(prisma.project.findFirst).mockResolvedValue({ id: 1 } as never);
    const formData = new FormData();
    formData.append('projectId', '1');
    formData.append('title', 'Created task');
    formData.append('status', 'OPEN');
    formData.append('assigneeId', '');
    formData.append('dueDate', '2026-06-01');
    formData.append('priority', 'MEDIUM');
    formData.append('description', 'Created description');

    await createTask(null, formData);
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        assigneeId: null,
        projectId: 1,
        title: 'Created task',
        status: 'OPEN',
        priority: 'MEDIUM',
        dueDate: new Date('2026-06-01'),
        description: 'Created description',
      },
    });
    expect(assigneeExists).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/projects/1/tasks');
    expect(redirect).toHaveBeenCalledWith('/projects/1/tasks');
  });
});
