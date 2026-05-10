import Link from 'next/link';
import {
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

export default async function DashboardPage() {
  const [stats, tasks, comments] = await Promise.all([
    getDashBoardStats(),
    getRecentTasks(),
    getRecentComments(),
  ]);

  if ('error' in stats) return <div>Unauthorized</div>;
  const recentTasks = 'error' in tasks ? [] : tasks;
  const recentComments = 'error' in comments ? [] : comments;

  const open = stats.tasks.filter((t) => t.status === 'OPEN').length;
  const developing = stats.tasks.filter(
    (t) => t.status === 'DEVELOPING'
  ).length;
  const review = stats.tasks.filter((t) => t.status === 'REVIEW').length;
  const closed = stats.tasks.filter((t) => t.status === 'CLOSED').length;

  const statCards = [
    { label: 'Projects', value: stats.projects.length },
    { label: 'Total Tasks', value: stats.tasks.length },
    { label: 'Open', value: open },
    { label: 'In Progress', value: developing },
    { label: 'Review', value: review },
    { label: 'Closed', value: closed },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your workspace
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl font-bold">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
