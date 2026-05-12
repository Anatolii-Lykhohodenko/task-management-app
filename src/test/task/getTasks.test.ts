import prisma from '@/lib/db/client';
import { getTasks } from '@/lib/db/queries';
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

describe('getTasks', () => {
  it('returns error when user is unauthorized', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(null);
    const result = await getTasks({
      projectId: 1,
      search: null,
      status: null,
      priority: null,
      sortBy: 'desc',
    });

    expect(result).toEqual({ error: 'Unauthorized' });
    expect(prisma.task.findMany).not.toHaveBeenCalled();
  });

  it('returns tasks when they are exist and no task filters/sorters are given', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(prisma.task.findMany).mockResolvedValue([
      { id: 1, title: 'title', status: 'OPEN', priority: 'MEDIUM' },
    ] as never);

    const result = await getTasks({
      projectId: 1,
      search: null,
      status: null,
      priority: null,
      sortBy: 'desc',
    });

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {
        project: {
          ownerId: 1,
        },
        projectId: 1,
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, status: true, priority: true },
    });

    expect(result).toEqual([
      { id: 1, title: 'title', status: 'OPEN', priority: 'MEDIUM' },
    ]);
  });

  it('returns tasks when they are exist and task filters/sorters are given', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(prisma.task.findMany).mockResolvedValue([
      { id: 3, title: 'title', status: 'DEVELOPING', priority: 'HIGH' },
    ] as never);

    const result = await getTasks({
      projectId: 1,
      search: 'task',
      status: 'DEVELOPING',
      priority: 'HIGH',
      sortBy: 'asc',
    });

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {
        project: {
          ownerId: 1,
        },
        status: 'DEVELOPING',
        priority: 'HIGH',
        title: { contains: 'task', mode: 'insensitive' },
        projectId: 1,
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true, title: true, status: true, priority: true },
    });

    expect(result).toEqual([
      { id: 3, title: 'title', status: 'DEVELOPING', priority: 'HIGH' },
    ]);
  });

  it('returns empty data when they are not exist', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(prisma.task.findMany).mockResolvedValue([] as never);

    const result = await getTasks({
      projectId: 4,
      search: 'task',
      status: 'DEVELOPING',
      priority: 'HIGH',
      sortBy: 'asc',
    });

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {
        project: {
          ownerId: 1,
        },
        status: 'DEVELOPING',
        priority: 'HIGH',
        title: { contains: 'task', mode: 'insensitive' },
        projectId: 4,
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true, title: true, status: true, priority: true },
    });

    expect(result).toEqual([]);
  });
});
