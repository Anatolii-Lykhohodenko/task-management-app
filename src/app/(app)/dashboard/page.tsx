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
} from 'lucide-react';

export const metadata = { title: 'Dashboard' };

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Open',
  DEVELOPING: 'In Progress',
  REVIEW: 'Review',
  CLOSED: 'Closed',
};

const STATUS_BADGE: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  DEVELOPING: 'bg-yellow-100 text-yellow-700',
  REVIEW: 'bg-purple-100 text-purple-700',
  CLOSED: 'bg-green-100 text-green-700',
};

type StatusStat = {
  status: string;
  _count: { status: number };
};

type PriorityStat = {
  priority: string;
  _count: { priority: number };
};

export default async function DashboardPage() {
  const [stats, tasks, comments, rawDeletedTasks] = await Promise.all([
    getDashBoardStats(),
    getRecentTasks(),
    getRecentComments(),
    findAllDeletedTasks({ take: 10 })
  ]);

  if ('error' in stats) return null;
  const recentTasks = 'error' in tasks ? [] : tasks;
  const deletedTasks = 'error' in rawDeletedTasks ? [] : rawDeletedTasks;
  const recentComments = 'error' in comments ? [] : comments;

  const statCards = [
    { label: 'Projects', value: stats.projectsCount, icon: LayoutGrid },
    { label: 'Total Tasks', value: stats.tasksCount, icon: ListTodo },
    {
      label: 'Open',
      value:
        stats.byStatus.find((task: StatusStat) => task.status === 'OPEN')
          ?._count.status ?? 0,
      icon: CircleDot,
    },
    {
      label: 'In Progress',
      value:
        stats.byStatus.find((task: StatusStat) => task.status === 'DEVELOPING')
          ?._count.status ?? 0,
      icon: Code,
    },
    {
      label: 'Review',
      value:
        stats.byStatus.find((task: StatusStat) => task.status === 'REVIEW')
          ?._count.status ?? 0,
      icon: Eye,
    },
    {
      label: 'Closed',
      value:
        stats.byStatus.find((task: StatusStat) => task.status === 'CLOSED')
          ?._count.status ?? 0,
      icon: CheckCircle2,
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: AlertCircle,
      danger: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your workspace
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        {statCards.map(({ label, value, icon: Icon, danger }) => (
          <Card key={label} size="sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription>{label}</CardDescription>
                <Icon
                  className={`h-4 w-4 ${danger && value > 0 ? 'text-destructive' : 'text-muted-foreground/50'}`}
                />
              </div>
              <CardTitle
                className={`text-2xl font-bold ${value === 0 ? 'text-muted-foreground/40' : danger && value > 0 ? 'text-destructive' : ''}`}
              >
                {value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {stats.tasksCount > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Status breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status breakdown</CardTitle>
              <CardDescription>{stats.tasksCount} tasks total</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Open', status: 'OPEN', color: 'bg-blue-500' },
                {
                  label: 'In Progress',
                  status: 'DEVELOPING',
                  color: 'bg-yellow-500',
                },
                { label: 'Review', status: 'REVIEW', color: 'bg-purple-500' },
                { label: 'Closed', status: 'CLOSED', color: 'bg-green-500' },
              ].map(({ label, status, color }) => {
                const count =
                  stats.byStatus.find((s: StatusStat) => s.status === status)
                    ?._count.status ?? 0;
                const pct = Math.round((count / stats.tasksCount) * 100);
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">
                        {count}{' '}
                        <span className="text-muted-foreground font-normal">
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Priority breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Priority breakdown</CardTitle>
              <CardDescription>{stats.tasksCount} tasks total</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Low', priority: 'LOW', color: 'bg-slate-400' },
                { label: 'Medium', priority: 'MEDIUM', color: 'bg-orange-400' },
                { label: 'High', priority: 'HIGH', color: 'bg-red-500' },
                {
                  label: 'Critical',
                  priority: 'CRITICAL',
                  color: 'bg-red-700',
                },
              ].map(({ label, priority, color }) => {
                const count =
                  stats.byPriority.find(
                    (p: PriorityStat) => p.priority === priority
                  )?._count.priority ?? 0;
                const pct = Math.round((count / stats.tasksCount) * 100);
                return (
                  <div key={priority} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">
                        {count}{' '}
                        <span className="text-muted-foreground font-normal">
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Last 10 created tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No tasks yet
              </p>
            ) : (
              <ul className="divide-y">
                {recentTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between py-2.5 gap-3"
                  >
                    <Link
                      href={`/projects/${task.projectId}/tasks/${task.id}`}
                      className="text-sm font-medium hover:underline truncate"
                    >
                      {task.title}
                    </Link>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[task.status]}`}
                    >
                      {STATUS_LABEL[task.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deleted Tasks</CardTitle>
            <CardDescription>Last 10 deleted tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {deletedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No deleted tasks yet
              </p>
            ) : (
              <ul className="divide-y">
                {deletedTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between py-2.5 gap-3"
                  >
                    <Link
                      href={`/projects/${task.projectId}/trash?highlight=${task.id}`}
                      className="text-sm font-medium hover:underline truncate"
                    >
                      {task.title}
                    </Link>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[task.status]}`}
                    >
                      {STATUS_LABEL[task.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Comments</CardTitle>
            <CardDescription>Your last 5 comments</CardDescription>
          </CardHeader>
          <CardContent>
            {recentComments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No comments yet
              </p>
            ) : (
              <ul className="divide-y">
                {recentComments.map((comment) => (
                  <li key={comment.id} className="py-2.5 space-y-0.5">
                    <Link
                      href={`/projects/${comment.task.projectId}/tasks/${comment.task.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {comment.task.title}
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">
                      {comment.text}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {comment.task.project.name} ·{' '}
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
