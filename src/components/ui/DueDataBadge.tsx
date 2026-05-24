export function DueDateBadge({ dueDate }: { dueDate: Date | null }) {
  if (!dueDate) return null;

  const now = new Date();
  const due = new Date(dueDate);
  const isOverdue = due < now;
  const formatted = new Date(dueDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <span
      className={`text-xs font-medium ${
        isOverdue ? 'text-destructive' : 'text-muted-foreground'
      }`}
    >
      {isOverdue ? `Overdue · ${formatted}` : `Due ${formatted}`}
    </span>
  );
}
