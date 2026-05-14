'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutList, LayoutGrid } from 'lucide-react';

export default function ViewToggle({ projectId }: { projectId: number }) {
  const pathname = usePathname();
  const isBoard = pathname.includes('/board');

  return (
    <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-1 w-fit">
      <Link
        href={`/projects/${projectId}/tasks`}
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
        href={`/projects/${projectId}/board`}
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
