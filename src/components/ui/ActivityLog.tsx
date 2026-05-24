import { ActivityType } from '@prisma/client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

type ActivityLogEntry = {
  id: number;
  activityType: ActivityType;
  payload: unknown;
  createdAt: Date;
  user: { name: string } | null;
};

type Props = {
  logs: ActivityLogEntry[];
};

function formatPayload(type: ActivityType, payload: unknown): string {
  const p = payload as Record<string, string> | null;
  switch (type) {
    case 'STATUS_CHANGED':
      return `Status changed: ${p?.from ?? '—'} → ${p?.to ?? '—'}`;
    case 'PRIORITY_CHANGED':
      return `Priority changed: ${p?.from ?? '—'} → ${p?.to ?? '—'}`;
    case 'ASSIGNEE_CHANGED':
      return p?.to ? `Assigned to ${p.to}` : 'Assignee removed';
    case 'DUE_DATE_CHANGED':
      return p?.to ? `Due date set: ${p.to}` : 'Due date removed';
    case 'TASK_CREATED':
      return 'Task created';
    case 'COMMENT_ADDED':
      return 'Left a comment';
    default:
      return 'Unknown action';
  }
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActivityLog({ logs }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity</CardTitle>
        <CardDescription>
          {logs.length === 0
            ? 'No activity yet'
            : `${logs.length} event${logs.length === 1 ? '' : 's'}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity recorded.</p>
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-4">
            {logs.map((log) => (
              <li key={log.id} className="relative">
                <span className="absolute -left-[1.3rem] mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-muted ring-2 ring-background">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                </span>
                <p className="text-sm text-foreground">
                  {formatPayload(log.activityType, log.payload)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {log.user?.name ?? 'Unknown user'} · {timeAgo(log.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
