import prisma from "@/lib/db/client";
import { Prisma } from "@prisma/client";

export async function findTaskInProject<T extends Prisma.TaskSelect>(
  taskId: number,
  projectId: number,
  select: T
) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
    },
    select,
  });
}
