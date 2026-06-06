import { CalendarClock, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DueDateBadge({ dueDate }: { dueDate: Date | null }) {
  if (!dueDate) return null;

  const now = new Date();
  const due = new Date(dueDate);
  const isOverdue = due < now;
  const diffMs = due.getTime() - now.getTime();
  const isDueSoon = !isOverdue && diffMs < 1000 * 60 * 60 * 48;

  const formatted = due.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        isOverdue
          ? 'text-red-500'
          : isDueSoon
            ? 'text-amber-500'
            : 'text-muted-foreground'
      )}
    >
      {isOverdue ? (
        <CalendarClock className="h-3 w-3" />
      ) : (
        <CalendarCheck className="h-3 w-3" />
      )}
      {isOverdue ? `Overdue · ${formatted}` : `Due ${formatted}`}
    </span>
  );
}
