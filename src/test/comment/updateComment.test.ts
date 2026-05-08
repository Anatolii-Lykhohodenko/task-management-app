import { describe, expect, it, vi } from 'vitest';
import prisma from '@/lib/db/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/server/auth';
import { updateComment } from '@/server/actions/comments';
import { findCommentInTasks } from '@/lib/db/queries';

vi.mock('@/lib/db/client', () => ({
  default: {
    comment: {
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/server/auth', () => ({
  getCurrentUserId: vi.fn(),
}));

vi.mock('@/lib/db/queries', () => ({
  findCommentInTasks: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('updateComment', () => {
  it('should return an error if user is not authorized', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(undefined);
    const formData = new FormData();
    formData.append('taskId', '1');
    formData.append('projectId', '2');
    formData.append('commentId', '3');
    const result = await updateComment(null, formData);

    expect(result).toEqual({ error: 'Unauthorized' });
    expect(prisma.comment.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(findCommentInTasks).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should return an error if taskId is invalid', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue('1');
    const formData = new FormData();
    formData.append('taskId', 'abc');
    formData.append('projectId', '2');
    formData.append('commentId', '3');
    formData.append('text', 'abc')
    const result = await updateComment(null, formData);

    expect(result).toEqual({ error: 'TaskId is invalid' });
    expect(prisma.comment.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(findCommentInTasks).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should return an error if projectId is invalid', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue('1');
    const formData = new FormData();
    formData.append('taskId', '1');
    formData.append('projectId', 'abc');
    formData.append('commentId', '3');
    formData.append('text', 'abc');
    const result = await updateComment(null, formData);

    expect(result).toEqual({ error: 'ProjectId is invalid' });
    expect(prisma.comment.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(findCommentInTasks).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should return an error if commentId is invalid', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue('1');
    const formData = new FormData();
    formData.append('taskId', '1');
    formData.append('projectId', '2');
    formData.append('commentId', 'abc');
    formData.append('text', 'abc');
    const result = await updateComment(null, formData);

    expect(result).toEqual({ error: 'CommentId is invalid' });
    expect(prisma.comment.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(findCommentInTasks).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should return an error if text is not defined', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue('1');
    const formData = new FormData();
    formData.append('taskId', '1');
    formData.append('projectId', '2');
    formData.append('commentId', '3');
    const result = await updateComment(null, formData);

    expect(result).toHaveProperty('error');
    expect(prisma.comment.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(findCommentInTasks).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should return an error if comment is not found', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue('1');
    vi.mocked(findCommentInTasks).mockResolvedValue(null);
    const formData = new FormData();
    formData.append('taskId', '1');
    formData.append('projectId', '2');
    formData.append('commentId', '3');
    formData.append('text', 'abc');
    const result = await updateComment(null, formData);

    expect(result).toEqual({ error: 'Comment not found' });
    expect(findCommentInTasks).toHaveBeenCalled();
    expect(prisma.comment.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should correctly update a comment', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue('1');
    vi.mocked(findCommentInTasks).mockResolvedValue({ id: 3 } as never);
    const formData = new FormData();
    formData.append('taskId', '1');
    formData.append('projectId', '2');
    formData.append('commentId', '3');
    formData.append('text', 'abc');
    await updateComment(null, formData);

    expect(findCommentInTasks).toHaveBeenCalled();
    expect(prisma.comment.update).toHaveBeenCalledWith({
      where: {
        id: 3,
      },
      data: {
        text: 'abc',
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/projects/2/tasks/1');
    expect(redirect).toHaveBeenCalledWith('/projects/2/tasks/1');
  });
});
