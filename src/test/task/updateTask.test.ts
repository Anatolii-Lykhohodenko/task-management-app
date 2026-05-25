import { describe, expect, it, vi } from 'vitest';
import { updateTask } from '@/server/actions/tasks';
import prisma from '@/lib/db/client';
import { findAssignee, findTaskInProject } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/server/auth';

vi.mock('@/lib/db/client', () => ({
  default: {
    task: {
      update: vi.fn(),
    },
    activityLog: {
      create: vi.fn()
    }
  },
}));
vi.mock('@/lib/db/queries', () => ({
  findTaskInProject: vi.fn(),
  findAssignee: vi.fn(),
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

describe('updateTask', () => {
  it('should return an error if projectId is invalid', async () => {
    vi.mocked(findAssignee).mockResolvedValue({ id: 5 } as never);
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    const formData = new FormData();
    formData.append('projectId', 'abc');
    formData.append('taskId', '2');
    formData.append('title', 'Updated task');
    formData.append('assigneeId', '5');
    formData.append('status', 'OPEN');
    formData.append('priority', 'MEDIUM');
    formData.append('description', 'Updated description');
    const result = await updateTask(null, formData);

    expect(findTaskInProject).not.toHaveBeenCalled();
    expect(prisma.task.update).not.toHaveBeenCalled();
    expect(result).toEqual({ error: 'Project not found' });
  });

  it('should return an error if assignee does not exist', async () => {
    vi.mocked(findAssignee).mockResolvedValue(null);
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    const formData = new FormData();
    formData.append('projectId', '1');
    formData.append('taskId', '2');
    formData.append('title', 'Updated task');
    formData.append('assigneeId', '5');
    formData.append('status', 'OPEN');
    formData.append('priority', 'MEDIUM');
    formData.append('description', 'Updated description');
    const result = await updateTask(null, formData);

    expect(findTaskInProject).not.toHaveBeenCalled();
    expect(prisma.task.update).not.toHaveBeenCalled();
    expect(result).toEqual({ error: 'Assignee not found' });
  });

  it('should return an error if taskId is invalid', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(findAssignee).mockResolvedValue({ id: 5 } as never);
    const formData = new FormData();
    formData.append('projectId', '2');
    formData.append('taskId', 'abc');
    formData.append('title', 'Updated task');
    formData.append('status', 'OPEN');
    formData.append('assigneeId', '5');
    formData.append('priority', 'MEDIUM');
    formData.append('description', 'Updated description');
    const result = await updateTask(null, formData);

    expect(findTaskInProject).not.toHaveBeenCalled();
    expect(prisma.task.update).not.toHaveBeenCalled();
    expect(result).toEqual({ error: 'Task not found' });
  });

  it('should correctly update an existent task', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(3);
    vi.mocked(findAssignee).mockResolvedValue({ id: 5 } as never);
    vi.mocked(findTaskInProject).mockResolvedValue({ id: 1 } as never);

    const formData = new FormData();
    formData.append('taskId', '1');
    formData.append('projectId', '2');
    formData.append('title', 'Updated task');
    formData.append('status', 'OPEN');
    formData.append('priority', 'MEDIUM');
    formData.append('dueDate', '2026-06-01');
    formData.append('assigneeId', '5');
    formData.append('description', 'Updated description');
    await updateTask(null, formData);

    expect(findTaskInProject).toHaveBeenCalledWith({
      ownerId: 3,
      projectId: 2,
      select: {
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
        dueDate: true,
        id: true,
        priority: true,
        status: true,
      },
      taskId: 1,
    });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        assigneeId: 5,
        title: 'Updated task',
        status: 'OPEN',
        priority: 'MEDIUM',
        description: 'Updated description',
        dueDate: new Date('2026-06-01'),
      },
    });

    expect(revalidatePath).toHaveBeenCalledWith('/projects/2/tasks/1');
    expect(redirect).toHaveBeenCalledWith('/projects/2/tasks/1');
  });

  it('should correctly update an existent task without dueDate', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(3);
    vi.mocked(findAssignee).mockResolvedValue({ id: 5 } as never);
    vi.mocked(findTaskInProject).mockResolvedValue({ id: 1 } as never);

    const formData = new FormData();
    formData.append('taskId', '1');
    formData.append('projectId', '2');
    formData.append('title', 'Updated task');
    formData.append('status', 'OPEN');
    formData.append('priority', 'MEDIUM');
    formData.append('dueDate', '');
    formData.append('assigneeId', '5');
    formData.append('description', 'Updated description');
    await updateTask(null, formData);

    expect(findTaskInProject).toHaveBeenCalledWith({
      ownerId: 3,
      projectId: 2,
      select: {
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
        dueDate: true,
        id: true,
        priority: true,
        status: true,
      },
      taskId: 1,
    });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        assigneeId: 5,
        title: 'Updated task',
        status: 'OPEN',
        priority: 'MEDIUM',
        description: 'Updated description',
        dueDate: null,
      },
    });

    expect(revalidatePath).toHaveBeenCalledWith('/projects/2/tasks/1');
    expect(redirect).toHaveBeenCalledWith('/projects/2/tasks/1');
  });

  it('should correctly update an existent task without assignee', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(3);
    vi.mocked(findTaskInProject).mockResolvedValue({ id: 1 } as never);

    const formData = new FormData();
    formData.append('taskId', '1');
    formData.append('projectId', '2');
    formData.append('title', 'Updated task');
    formData.append('status', 'OPEN');
    formData.append('priority', 'MEDIUM');
    formData.append('dueDate', '2026-06-01');
    formData.append('assigneeId', '');
    formData.append('description', 'Updated description');
    await updateTask(null, formData);

    expect(findTaskInProject).toHaveBeenCalledWith({
      ownerId: 3,
      projectId: 2,
      select: {
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
        dueDate: true,
        id: true,
        priority: true,
        status: true,
      },
      taskId: 1,
    });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        assigneeId: null,
        title: 'Updated task',
        status: 'OPEN',
        priority: 'MEDIUM',
        description: 'Updated description',
        dueDate: new Date('2026-06-01'),
      },
    });

    expect(findAssignee).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/projects/2/tasks/1');
    expect(redirect).toHaveBeenCalledWith('/projects/2/tasks/1');
  });

  it('should return an error if task does not exist', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(findAssignee).mockResolvedValue({ id: 5 } as never);
    vi.mocked(findTaskInProject).mockResolvedValue(null);

    const formData = new FormData();
    formData.append('projectId', '2');
    formData.append('taskId', '1');
    formData.append('assigneeId', '5');
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

  it('should return an error if user is unauthorized', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(null);
    const formData = new FormData();
    formData.append('projectId', '2');
    formData.append('taskId', '1');
    formData.append('title', 'Updated task');
    formData.append('status', 'OPEN');
    formData.append('priority', 'MEDIUM');
    formData.append('description', 'Updated description');
    const result = await updateTask(null, formData);

    expect(result).toEqual({ error: 'Unauthorized' });
    expect(prisma.task.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
