import prisma from '@/lib/db/client';
import { getRecentComments } from '@/lib/db/queries';
import { getCurrentUserId } from '@/lib/server/auth';
import { describe, expect, it, vi } from 'vitest';
vi.unmock('@/lib/db/queries');

vi.mock('@/lib/db/client', () => ({
  default: {
    comment: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/server/auth', () => ({
  getCurrentUserId: vi.fn(),
}));

describe('getRecentComments', () => {
  it('returns error when user is unauthorized', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(null);
    const result = await getRecentComments();

    expect(result).toEqual({ error: 'Unauthorized' });
    expect(prisma.comment.findMany).not.toHaveBeenCalled();
  });

  it('returns comments when they are exist', async () => {
    const date = new Date();
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(prisma.comment.findMany).mockResolvedValue([
      {
        id: 1,
        createdAt: date,
        text: 'text',
        task: {
          id: 2,
          project: {
            name: 'name',
          },
          title: 'title',
          projectId: 3,
        },
      },
    ] as never);

    const result = await getRecentComments();

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: {
        userId: 1,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        text: true,
        createdAt: true,
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
            project: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    expect(result).toEqual([
      {
        id: 1,
        createdAt: date,
        text: 'text',
        task: {
          id: 2,
          project: {
            name: 'name',
          },
          title: 'title',
          projectId: 3,
        },
      },
    ]);
  });

  it('returns empty data when comments are not exist', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(prisma.comment.findMany).mockResolvedValue([] as never);

    const result = await getRecentComments();

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: {
        userId: 1,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        text: true,
        createdAt: true,
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
            project: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    expect(result).toEqual([]);
  });
});
