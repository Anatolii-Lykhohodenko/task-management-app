export const SORT_BY_OPTIONS = [
  'createdAt_asc',
  'createdAt_desc',
  'dueDate_asc',
  'dueDate_desc',
] as const;
export type SortByParam = (typeof SORT_BY_OPTIONS)[number];
