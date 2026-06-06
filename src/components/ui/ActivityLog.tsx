import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ActivityType =
  | 'TASK_CREATED'
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'ASSIGNEE_CHANGED'
  | 'COMMENT_ADDED'
  | 'DUE_DATE_CHANGED'
  | 'TASK_DELETED'
  | 'TASK_RESTORED';

type ActivityLogEntry = {
  id: number;
  activityType: ActivityType;
  payload: unknown;
  createdAt: Date;
  user: { name: string } | null;
};

type Props = { logs: ActivityLogEntry[] };

const ACTIVITY_DOT: Record<ActivityType, string> = {
  TASK_CREATED: 'bg-emerald-500',
  STATUS_CHANGED: 'bg-blue-500',
  PRIORITY_CHANGED: 'bg-orange-500',
  ASSIGNEE_CHANGED: 'bg-violet-500',
  COMMENT_ADDED: 'bg-muted-foreground',
  DUE_DATE_CHANGED: 'bg-amber-500',
  TASK_DELETED: 'bg-destructive',
  TASK_RESTORED: 'bg-primary',
};

function formatPayload(type: ActivityType, payload: unknown): string {
  const p = payload as Record<string, string> | null;
  switch (type) {
    case 'STATUS_CHANGED':
      return `changed status from ${p?.from ?? '—'} to ${p?.to ?? '—'}`;
    case 'PRIORITY_CHANGED':
      return `changed priority from ${p?.from ?? '—'} to ${p?.to ?? '—'}`;
    case 'ASSIGNEE_CHANGED':
      return p?.to
        ? p?.from
          ? `reassigned from ${p.from} to ${p.to}`
          : `assigned to ${p.to}`
        : 'removed assignee';
    case 'DUE_DATE_CHANGED':
      return p?.to
        ? `set due date to ${new Date(p.to).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
        : 'removed due date';
    case 'TASK_CREATED':
      return 'created this task';
    case 'TASK_DELETED':
      return 'moved to trash';
    case 'TASK_RESTORED':
      return 'restored from trash';
    case 'COMMENT_ADDED':
      return 'left a comment';
    default:
      return 'performed an action';
  }
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ActivityLog({ logs }: Props) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Activity</CardTitle>
          {logs.length > 0 && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {logs.length} event{logs.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No activity yet.</p>
        ) : (
          <ol className="relative space-y-3 border-l border-border/40 pl-4">
            {logs.map((log) => (
              <li key={log.id} className="relative">
                {/* Timeline dot */}
                <span className="absolute -left-[1.35rem] mt-0.75 flex h-4 w-4 items-center justify-center rounded-full bg-background ring-1 ring-border/40">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      ACTIVITY_DOT[log.activityType]
                    )}
                  />
                </span>

                <p className="text-xs leading-relaxed">
                  <span className="font-medium text-foreground">
                    {log.user?.name ?? 'Unknown'}
                  </span>{' '}
                  <span className="text-muted-foreground">
                    {formatPayload(log.activityType, log.payload)}
                  </span>
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                  {timeAgo(log.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
