import prisma from '@/lib/db/client';
import { getDashBoardStats } from '@/lib/db/queries';
import { getCurrentUserId } from '@/lib/server/auth';
import { describe, expect, it, vi } from 'vitest';
vi.unmock('@/lib/db/queries');

vi.mock('@/lib/db/client', () => ({
  default: {
    task: {
      findMany: vi.fn(),
    },
    project: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/server/auth', () => ({
  getCurrentUserId: vi.fn(),
}));

describe('getDashBoardStats', () => {
  it('returns error when user is unauthorized', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(null);
    const result = await getDashBoardStats();

    expect(result).toEqual({ error: 'Unauthorized' });
    expect(prisma.project.findMany).not.toHaveBeenCalled();
    expect(prisma.task.findMany).not.toHaveBeenCalled();
  });

  it('returns projects and tasks when they are exist', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(prisma.task.findMany).mockResolvedValue([{
      id: 2,
      status: 'OPEN',
    }] as never);
    vi.mocked(prisma.project.findMany).mockResolvedValue([{
      id: 1,
      name: 'name',
    }] as never);

    const result = await getDashBoardStats();

    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: {
        ownerId: 1,
      },
      select: {
        id: true,
        name: true,
      },
    });
    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {
        project: {
          ownerId: 1,
        },
      },
      select: { status: true, id: true },
    });

    expect(result).toEqual({
      projects: [
        {
          id: 1,
          name: 'name',
        },
      ],

      tasks: [
        {
          id: 2,
          status: 'OPEN',
        },
      ],
    });
  });

  it('returns empty data when projects and tasks are not exist', async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(1);
    vi.mocked(prisma.task.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.project.findMany).mockResolvedValue([] as never);

    const result = await getDashBoardStats();

    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: {
        ownerId: 1,
      },
      select: {
        id: true,
        name: true,
      },
    });
    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {
        project: {
          ownerId: 1,
        },
      },
      select: { status: true, id: true },
    });

    expect(result).toEqual({
      projects: [],
      tasks: [],
    });
  });
});
