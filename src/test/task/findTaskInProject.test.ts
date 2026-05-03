/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';
import prisma from '@/lib/db/client';
import { findTaskInProject } from '@/lib/db/queries';

vi.mock('@/lib/db/client', () => ({
  default: {
    task: {
      findFirst: vi.fn(),
    },
  },
}));

describe('findTaskInProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns task when task exists in project', async () => {
    vi.mocked(prisma.task.findFirst).mockResolvedValue({
      title: 'Test task',
      status: 'OPEN',
      priority: 'MEDIUM',
      description: 'Test description',
    } as any);

    const result = await findTaskInProject(1, 2, {
      title: true,
      status: true,
      priority: true,
      description: true,
    });

    expect(prisma.task.findFirst).toHaveBeenCalledWith({
      where: {
        id: 1,
        projectId: 2,
      },
      select: {
        title: true,
        status: true,
        priority: true,
        description: true,
      },
    });

    expect(result).toEqual({
      title: 'Test task',
      status: 'OPEN',
      priority: 'MEDIUM',
      description: 'Test description',
    });
  });

  it('returns null when task does not exist in project', async () => {
    vi.mocked(prisma.task.findFirst).mockResolvedValue(null);

    const result = await findTaskInProject(1, 999, {
      title: true,
      status: true,
      priority: true,
      description: true,
    });

    expect(prisma.task.findFirst).toHaveBeenCalledWith({
      where: {
        id: 1,
        projectId: 999,
      },
      select: {
        title: true,
        status: true,
        priority: true,
        description: true,
      },
    });

    expect(result).toBeNull();
  });

  it('calls a function with correct select param', async () => {
    await findTaskInProject(1, 999, {
      title: true,
      status: false,
      priority: true,
      description: false,
    });

    expect(prisma.task.findFirst).toHaveBeenCalledWith({
      where: {
        id: 1,
        projectId: 999,
      },
      select: {
        title: true,
        status: false,
        priority: true,
        description: false,
      },
    });
  });
});
