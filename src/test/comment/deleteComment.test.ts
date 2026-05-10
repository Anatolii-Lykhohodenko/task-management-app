import { describe, expect, it, vi } from 'vitest';
import prisma from '@/lib/db/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/server/auth';
import { deleteComment } from '@/server/actions/comments';
import { findCommentInTasks } from '@/lib/db/queries';

vi.mock('@/lib/db/client', () => ({
  default: {
    comment: {
      delete: vi.fn(),
    }
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

describe('deleteComment', () => {
  it('should return an error if user is not authorized', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(null);
    const formData = new FormData();
    formData.append('taskId', '1');
    formData.append('projectId', '2');
    formData.append('commentId', '3');
    const result = await deleteComment(null, formData);

    expect(result).toEqual({ error: 'Unauthorized' });
    expect(prisma.comment.delete).not.toHaveBeenCalled();
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
    const result = await deleteComment(null, formData);

    expect(result).toEqual({ error: 'TaskId is invalid' });
    expect(prisma.comment.delete).not.toHaveBeenCalled();
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
    const result = await deleteComment(null, formData);

    expect(result).toEqual({ error: 'ProjectId is invalid' });
    expect(prisma.comment.delete).not.toHaveBeenCalled();
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
    const result = await deleteComment(null, formData);

    expect(result).toEqual({ error: 'CommentId is invalid' });
    expect(prisma.comment.delete).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(findCommentInTasks).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should return an error if comment not found', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue('1');
    vi.mocked(findCommentInTasks).mockResolvedValue(null);
    const formData = new FormData();
    formData.append('taskId', '1');
    formData.append('projectId', '2');
    formData.append('commentId', '3');
    const result = await deleteComment(null, formData);

    expect(result).toEqual({ error: 'Comment not found' });
    expect(prisma.comment.delete).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(findCommentInTasks).toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should correctly delete a comment', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue('1');
    vi.mocked(findCommentInTasks).mockResolvedValue({ id: 3 } as never);
    const formData = new FormData();
    formData.append('taskId', '1');
    formData.append('projectId', '2');
    formData.append('commentId', '3');
    await deleteComment(null, formData);

    expect(prisma.comment.delete).toHaveBeenCalledWith({
      where: {
        id: 3,
      },
    });
    expect(findCommentInTasks).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/projects/2/tasks/1');
    expect(redirect).toHaveBeenCalledWith('/projects/2/tasks/1', 'replace');
  });
});
