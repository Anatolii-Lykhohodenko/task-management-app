import Link from 'next/link';
import {
  findAllDeletedTasks,
  getDashBoardStats,
  getRecentComments,
  getRecentTasks,
} from '@/lib/db/queries';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  LayoutGrid,
  ListTodo,
  CircleDot,
  Code,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Status, Priority } from '@/types';

export const metadata = { title: 'Dashboard' };

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Open',
  DEVELOPING: 'In Progress',
  REVIEW: 'Review',
  CLOSED: 'Closed',
};
const STATUS_BADGE: Record<string, string> = {
  OPEN: 'bg-blue-500/10 text-blue-500',
  DEVELOPING: 'bg-amber-500/10 text-amber-500',
  REVIEW: 'bg-violet-500/10 text-violet-500',
  CLOSED: 'bg-emerald-500/10 text-emerald-500',
};
const STATUS_BAR: Record<string, string> = {
  OPEN: 'bg-blue-500',
  DEVELOPING: 'bg-amber-500',
  REVIEW: 'bg-violet-500',
  CLOSED: 'bg-emerald-500',
};
const PRIORITY_BAR: Record<string, string> = {
  LOW: 'bg-slate-400',
  MEDIUM: 'bg-orange-400',
  HIGH: 'bg-red-500',
  CRITICAL: 'bg-red-700',
};

type StatusStat = { status: string; _count: { status: number } };
type PriorityStat = { priority: string; _count: { priority: number } };

export default async function DashboardPage() {
  const [stats, tasks, comments, rawDeletedTasks] = await Promise.all([
    getDashBoardStats(),
    getRecentTasks(),
    getRecentComments(),
    findAllDeletedTasks({ take: 10 }),
  ]);

  if ('error' in stats) return null;
  const recentTasks = 'error' in tasks ? [] : tasks;
  const deletedTasks = 'error' in rawDeletedTasks ? [] : rawDeletedTasks;
  const recentComments = 'error' in comments ? [] : comments;

  const statCards = [
    {
      label: 'Projects',
      value: stats.projectsCount,
      icon: LayoutGrid,
      accent: 'text-primary bg-primary/10',
    },
    {
      label: 'Total tasks',
      value: stats.tasksCount,
      icon: ListTodo,
      accent: 'text-primary bg-primary/10',
    },
    {
      label: 'Open',
      value:
        stats.byStatus.find((t: StatusStat) => t.status === 'OPEN')?._count
          .status ?? 0,
      icon: CircleDot,
      accent: 'text-blue-500 bg-blue-500/10',
    },
    {
      label: 'In Progress',
      value:
        stats.byStatus.find((t: StatusStat) => t.status === 'DEVELOPING')
          ?._count.status ?? 0,
      icon: Code,
      accent: 'text-amber-500 bg-amber-500/10',
    },
    {
      label: 'Review',
      value:
        stats.byStatus.find((t: StatusStat) => t.status === 'REVIEW')?._count
          .status ?? 0,
      icon: Eye,
      accent: 'text-violet-500 bg-violet-500/10',
    },
    {
      label: 'Closed',
      value:
        stats.byStatus.find((t: StatusStat) => t.status === 'CLOSED')?._count
          .status ?? 0,
      icon: CheckCircle2,
      accent: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: AlertCircle,
      accent: 'text-red-500 bg-red-500/10',
      danger: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Overview
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your workspace activity.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {statCards.map(({ label, value, icon: Icon, accent, danger }) => (
          <Card
            key={label}
            className={cn(
              'shadow-none',
              danger && value > 0
                ? 'border-red-500/25 bg-red-500/5'
                : 'border-border/50'
            )}
          >
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">{label}</CardDescription>
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-md',
                    accent
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <p
                className={cn(
                  'text-2xl font-bold tabular-nums leading-none',
                  value === 0
                    ? 'text-muted-foreground/25'
                    : danger && value > 0
                      ? 'text-red-500'
                      : 'text-foreground'
                )}
              >
                {value}
              </p>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Breakdowns */}
      {stats.tasksCount > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Status */}
          <Card className="border-border/50 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Status breakdown
              </CardTitle>
              <CardDescription className="text-xs">
                {stats.tasksCount} tasks total
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(['OPEN', 'DEVELOPING', 'REVIEW', 'CLOSED'] as const).map(
                (status) => {
                  const count =
                    stats.byStatus.find((s: StatusStat) => s.status === status)
                      ?._count.status ?? 0;
                  const pct = Math.round((count / stats.tasksCount) * 100);
                  return (
                    <div key={status} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {STATUS_LABEL[status]}
                        </span>
                        <span className="tabular-nums font-medium">
                          {count}{' '}
                          <span className="font-normal text-muted-foreground/50">
                            ({pct}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            STATUS_BAR[status]
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </CardContent>
          </Card>

          {/* Priority */}
          <Card className="border-border/50 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Priority breakdown
              </CardTitle>
              <CardDescription className="text-xs">
                {stats.tasksCount} tasks total
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(
                (priority) => {
                  const count =
                    stats.byPriority.find(
                      (p: PriorityStat) => p.priority === priority
                    )?._count.priority ?? 0;
                  const pct = Math.round((count / stats.tasksCount) * 100);
                  return (
                    <div key={priority} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground capitalize">
                          {priority.charAt(0) + priority.slice(1).toLowerCase()}
                        </span>
                        <span className="tabular-nums font-medium">
                          {count}{' '}
                          <span className="font-normal text-muted-foreground/50">
                            ({pct}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            PRIORITY_BAR[priority]
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent lists */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Tasks */}
        <Card className="border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">
                Recent tasks
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Last 10 created
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentTasks.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                No tasks yet
              </p>
            ) : (
              <ul className="divide-y divide-border/50">
                {recentTasks.map(
                  (task: {
                    id: number;
                    createdAt: Date;
                    project: { name: string };
                    title: string;
                    status: Status;
                    projectId: number;
                  }) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between gap-3 px-5 py-2.5 transition-colors hover:bg-muted/40"
                    >
                      <Link
                        href={`/projects/${task.projectId}/tasks/${task.id}`}
                        className="min-w-0 truncate text-sm font-medium transition-colors hover:text-primary"
                      >
                        {task.title}
                      </Link>
                      <span
                        className={cn(
                          'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                          STATUS_BADGE[task.status]
                        )}
                      >
                        {STATUS_LABEL[task.status]}
                      </span>
                    </li>
                  )
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Deleted Tasks */}
        <Card className="border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">
                Deleted tasks
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Last 10 deleted
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {deletedTasks.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                No deleted tasks
              </p>
            ) : (
              <ul className="divide-y divide-border/50">
                {deletedTasks.map(
                  (task: {
                    id: number;
                    title: string;
                    status: Status;
                    priority: Priority;
                    deletedAt: Date | null;
                    projectId: number;
                    logs: { user: { name: string } | null }[];
                    assignee: { name: string } | null;
                  }) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between gap-3 px-5 py-2.5 transition-colors hover:bg-muted/40"
                    >
                      <Link
                        href={`/projects/${task.projectId}/trash?highlight=${task.id}`}
                        className="min-w-0 truncate text-sm font-medium transition-colors hover:text-primary"
                      >
                        {task.title}
                      </Link>
                      <span
                        className={cn(
                          'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                          STATUS_BADGE[task.status]
                        )}
                      >
                        {STATUS_LABEL[task.status]}
                      </span>
                    </li>
                  )
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Comments */}
        <Card className="border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">
                Recent comments
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Your last 5 comments
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentComments.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                No comments yet
              </p>
            ) : (
              <ul className="divide-y divide-border/50">
                {recentComments.map(
                  (comment: {
                    id: number;
                    createdAt: Date;
                    text: string;
                    task: {
                      id: number;
                      project: { name: string };
                      title: string;
                      projectId: number;
                    };
                  }) => (
                    <li
                      key={comment.id}
                      className="px-5 py-2.5 transition-colors hover:bg-muted/40"
                    >
                      <Link
                        href={`/projects/${comment.task.projectId}/tasks/${comment.task.id}`}
                        className="block text-sm font-medium transition-colors hover:text-primary"
                      >
                        {comment.task.title}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {comment.text}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground/50">
                        {comment.task.project.name} ·{' '}
                        {new Date(comment.createdAt).toLocaleDateString(
                          'en-GB',
                          { day: '2-digit', month: 'short', year: 'numeric' }
                        )}
                      </p>
                    </li>
                  )
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
