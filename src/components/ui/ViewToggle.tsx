'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutList, LayoutGrid } from 'lucide-react';

type Props = {
  projectId: number;
};

export default function ViewToggle({ projectId }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString()
    ? `?${searchParams.toString()}`
    : '';

  const listUrl = `/projects/${projectId}/tasks${searchParamsStr}`;
  const boardUrl = `/projects/${projectId}/board${searchParamsStr}`;

  const isBoard = pathname.includes('/board');

  return (
    <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-1 w-fit">
      <Link
        href={listUrl}
        className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm transition-colors ${
          !isBoard
            ? 'bg-background text-foreground shadow-sm font-medium'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <LayoutList className="h-3.5 w-3.5" />
        List
      </Link>
      <Link
        href={boardUrl}
        className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm transition-colors ${
          isBoard
            ? 'bg-background text-foreground shadow-sm font-medium'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Board
      </Link>
    </div>
  );
}
