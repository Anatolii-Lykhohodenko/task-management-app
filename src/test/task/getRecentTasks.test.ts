import prisma from '@/lib/db/client';
import { getRecentTasks } from '@/lib/db/queries';
import { getCurrentUserId } from '@/lib/server/auth';
import { describe, expect, it, vi } from 'vitest';
vi.unmock('@/lib/db/queries');

vi.mock('@/lib/db/client', () => ({
  default: {
    task: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/server/auth', () => ({
  getCurrentUserId: vi.fn(),
}));

describe('getRecentTasks', () => {
  it('returns error when user is unauthorized', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(null);
    const result = await getRecentTasks();

    expect(result).toEqual({ error: 'Unauthorized' });
    expect(prisma.task.findMany).not.toHaveBeenCalled();
  });

  it('returns tasks when they are exist', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(prisma.task.findMany).mockResolvedValue([
      {
        id: 2,
        status: 'OPEN',
      },
    ] as never);

    const result = await getRecentTasks();

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {
        project: {
          ownerId: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        projectId: true,
        project: {
          select: { name: true },
        },
      },
    });

    expect(result).toEqual([
      {
        id: 2,
        status: 'OPEN',
      },
    ]);
  });

  it('returns empty data when tasks are not exist', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(prisma.task.findMany).mockResolvedValue([] as never);

    const result = await getRecentTasks();

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {
        project: {
          ownerId: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        projectId: true,
        project: {
          select: { name: true },
        },
      },
    });

    expect(result).toEqual([]);
  });
});
