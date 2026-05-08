import { describe, expect, it, vi } from 'vitest';
import prisma from '@/lib/db/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/server/auth';
import { createComment } from '@/server/actions/comments';
import { findTaskInProject } from '@/lib/db/queries';

vi.mock('@/lib/db/client', () => ({
  default: {
    comment: {
      create: vi.fn(),
    }
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

describe('createComment', () => {
  it('should return an error if task not found', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue('1')
    vi.mocked(findTaskInProject).mockResolvedValue(null);
    const formData = new FormData();
    formData.append('taskId', 'abc');
    formData.append('projectId', '2');
    formData.append('parentId', '3');
    formData.append('text', 'some_text');
    const result = await createComment(null, formData);

    expect(result).toEqual({ error: 'Task not found' });
    expect(prisma.comment.create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should return an error if user is unauthorized', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(undefined);
    vi.mocked(findTaskInProject).mockResolvedValue({ id: 1 } as never);
    const formData = new FormData();
    formData.append('taskId', '1');
    formData.append('projectId', '2');
    formData.append('parentId', '3');
    formData.append('text', 'some_text');
    const result = await createComment(null, formData);

    expect(result).toEqual({ error: 'Unauthorized'});
    expect(prisma.comment.create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should return an error if text is not provided', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue('1');
    vi.mocked(findTaskInProject).mockResolvedValue({ id: 1 } as never);
    const formData = new FormData();
    formData.append('taskId', '1');
    formData.append('projectId', '2');
    formData.append('parentId', '3');
    const result = await createComment(null, formData);

    expect(result).toHaveProperty('error');
    expect(prisma.comment.create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should correctly create a comment', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue('1');
    vi.mocked(findTaskInProject).mockResolvedValue({ id: 1 } as never);
    const formData = new FormData();
    formData.append('taskId', '1');
    formData.append('projectId', '2');
    formData.append('parentId', '3');
    formData.append('text', 'some_text');
    await createComment(null, formData);

    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: {
        text: 'some_text',
        taskId: 1,
        userId: 1,
        parentId: 3,
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/projects/2/tasks/1');
    expect(redirect).toHaveBeenCalledWith('/projects/2/tasks/1');
  });
});
