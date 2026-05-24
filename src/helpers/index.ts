import { SortByType } from "@/types";

export function parseSortBy(sortBy: string | undefined): SortByType {
  const map: Record<string, SortByType> = {
    createdAt_asc: { createdAt: 'asc' },
    createdAt_desc: { createdAt: 'desc' },
    dueDate_asc: { dueDate: 'asc' },
    dueDate_desc: { dueDate: 'desc' },
  };
  return map[sortBy ?? ''] ?? { createdAt: 'desc' };
}
