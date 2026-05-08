/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/db/client';
import { findCommentInTasks } from '@/lib/db/queries';
import { describe, expect, it, vi } from 'vitest';
vi.unmock('@/lib/db/queries');

vi.mock('@/lib/db/client', () => ({
  default: {
    task: {
      findFirst: vi.fn(),
    },
    comment: {
      findFirst: vi.fn(),
    },
  },
}));

describe('findCommentInTasks', () => {
  it('returns comment when task and comment exist', async () => {
    vi.mocked(prisma.task.findFirst).mockResolvedValue({ id: 2 } as any);
    vi.mocked(prisma.comment.findFirst).mockResolvedValue({
      text: 'text',
    } as any);

    const result = await findCommentInTasks({
      taskId: 1,
      projectId: 2,
      ownerId: 3,
      commentId: 4,
      select: { text: true },
    });

    expect(prisma.comment.findFirst).toHaveBeenCalledWith({
      where: {
        id: 4,
        taskId: 2,
        userId: 3,
      },
      select: { text: true },
    });

    expect(result).toEqual({ text: 'text' });
  });

  it('returns null when task exist and comment does not exist', async () => {
    vi.mocked(prisma.task.findFirst).mockResolvedValue({ id: 2 } as any);
    vi.mocked(prisma.comment.findFirst).mockResolvedValue(null);

    const result = await findCommentInTasks({
      taskId: 1,
      projectId: 2,
      ownerId: 3,
      commentId: 4,
      select: { text: true },
    });

    expect(prisma.comment.findFirst).toHaveBeenCalledWith({
      where: {
        id: 4,
        taskId: 2,
        userId: 3,
      },
      select: { text: true },
    });

    expect(result).toEqual(null);
  });

  it('returns null when task does not exist', async () => {
    vi.mocked(prisma.task.findFirst).mockResolvedValue(null);

    const result = await findCommentInTasks({
      taskId: 1,
      projectId: 2,
      ownerId: 3,
      commentId: 4,
      select: { text: true },
    });

    expect(result).toBe(null);
    expect(prisma.comment.findFirst).not.toHaveBeenCalled();
  });
});
