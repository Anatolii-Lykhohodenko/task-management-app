import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/db/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { deleteProject } from '@/server/actions/projects';
import { DialogYesOrNo } from '@/components/ui/DialogYesOrNo';
import { getCurrentUserId } from '@/lib/server/auth';
import {
  Pencil,
  Trash2,
  ListTodo,
  LayoutDashboard,
  Trash,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Priority, Status } from '@/types';

type Props = {
  params: Promise<{ projectId: string }>;
};

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  OPEN: { label: 'Open', className: 'bg-blue-500/10 text-blue-500' },
  DEVELOPING: {
    label: 'In Progress',
    className: 'bg-amber-500/10 text-amber-500',
  },
  REVIEW: { label: 'Review', className: 'bg-violet-500/10 text-violet-500' },
  CLOSED: { label: 'Closed', className: 'bg-emerald-500/10 text-emerald-500' },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> =
  {
    LOW: { label: 'Low', className: 'bg-slate-500/10 text-slate-400' },
    MEDIUM: { label: 'Medium', className: 'bg-orange-500/10 text-orange-500' },
    HIGH: { label: 'High', className: 'bg-red-500/10 text-red-500' },
    CRITICAL: { label: 'Critical', className: 'bg-red-900/20 text-red-400' },
  };

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;
  const ownerId = await getCurrentUserId();
  if (!ownerId) return null;

  const numericProjectId = Number(projectId);
  if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) notFound();

  const [project, deletedCount] = await Promise.all([
    prisma.project.findUnique({
      select: {
        user: { select: { name: true } },
        tasks: {
          where: { deletedAt: null },
          select: { title: true, id: true, status: true, priority: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: { select: { tasks: { where: { deletedAt: null } } } },
        name: true,
        createdAt: true,
      },
      where: { id: numericProjectId, ownerId },
    }),
    prisma.task.count({
      where: { projectId: numericProjectId, deletedAt: { not: null } },
    }),
  ]);

  if (!project) notFound();

  const deleteWithIds = deleteProject.bind(null, { id: projectId });

  const description = !project._count.tasks
    ? 'This will permanently delete the project.'
    : project._count.tasks === 1
      ? `This will permanently delete the project and its ${project._count.tasks} task.`
      : `This will permanently delete the project and all ${project._count.tasks} tasks.`;

  const formattedDate = project.createdAt.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Status breakdown
  const statusCounts = {
    OPEN: project.tasks.filter((t) => t.status === 'OPEN').length,
    DEVELOPING: project.tasks.filter((t) => t.status === 'DEVELOPING').length,
    REVIEW: project.tasks.filter((t) => t.status === 'REVIEW').length,
    CLOSED: project.tasks.filter((t) => t.status === 'CLOSED').length,
  };

  const navLinks = [
    {
      href: `/projects/${projectId}/tasks`,
      icon: ListTodo,
      label: 'Tasks',
      description: `${project._count.tasks} total`,
    },
    {
      href: `/projects/${projectId}/board`,
      icon: LayoutDashboard,
      label: 'Board',
      description: 'Kanban view',
    },
    {
      href: `/projects/${projectId}/trash`,
      icon: Trash,
      label: 'Trash',
      description: deletedCount > 0 ? `${deletedCount} deleted` : 'Empty',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/projects/"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to projects
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Project
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {project.user.name} · Created {formattedDate}
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href={`/projects/${projectId}/edit`}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
          <DialogYesOrNo
            title="Delete project?"
            description={description}
            confirmText="Delete project"
            cancelText="Cancel"
            variant="destructive"
            action={deleteWithIds}
          >
            <Button variant="destructive" className="w-full sm:w-auto">
              Delete project
            </Button>
          </DialogYesOrNo>
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {navLinks.map(({ href, icon: Icon, label, description }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between rounded-lg border border-border/50 bg-card px-4 py-3 transition-all hover:border-border hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-5">
          {/* Status breakdown */}
          {project._count.tasks > 0 && (
            <Card className="shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Status breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.keys(statusCounts) as Status[]).map((s) => (
                  <Link
                    key={s}
                    href={`/projects/${projectId}/tasks?status=${s}`}
                    className="group rounded-md border border-border/50 px-3 py-2.5 text-center transition-all hover:border-border hover:shadow-sm"
                  >
                    <p className="text-xl font-semibold tabular-nums">
                      {statusCounts[s]}
                    </p>
                    <p
                      className={cn(
                        'mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        STATUS_CONFIG[s].className
                      )}
                    >
                      {STATUS_CONFIG[s].label}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent tasks */}
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-medium">
                  Recent tasks
                </CardTitle>
                <CardDescription className="text-xs">
                  Last 5 active tasks
                </CardDescription>
              </div>
              <Link
                href={`/projects/${projectId}/tasks`}
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {project._count.tasks === 0 ? (
                <div className="px-6 pb-6 pt-2">
                  <div className="rounded-lg border border-dashed px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No tasks yet
                    </p>
                    <Link
                      href={`/projects/${projectId}/tasks`}
                      className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                    >
                      Create the first task →
                    </Link>
                  </div>
                </div>
              ) : (
                <ul>
                  {project.tasks.map((task, i) => (
                    <li
                      key={task.id}
                      className={cn(i !== 0 && 'border-t border-border/40')}
                    >
                      <Link
                        href={`/projects/${projectId}/tasks/${task.id}`}
                        className="flex items-center justify-between gap-4 px-6 py-2.5 transition-colors hover:bg-muted/40"
                      >
                        <p className="min-w-0 truncate text-sm">{task.title}</p>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                              STATUS_CONFIG[task.status].className
                            )}
                          >
                            {STATUS_CONFIG[task.status].label}
                          </span>
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                              PRIORITY_CONFIG[task.priority].className
                            )}
                          >
                            {PRIORITY_CONFIG[task.priority].label}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Project details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Owner', value: project.user.name },
                { label: 'Created', value: formattedDate },
                { label: 'Active tasks', value: String(project._count.tasks) },
                { label: 'In trash', value: String(deletedCount) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-2"
                >
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xs font-medium">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {deletedCount > 0 && (
            <Link
              href={`/projects/${projectId}/trash`}
              className="flex items-center justify-between rounded-lg border border-border/50 bg-card px-4 py-3 text-sm transition-all hover:border-border hover:shadow-sm"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Trash2 className="h-3.5 w-3.5" />
                <span>
                  {deletedCount} task{deletedCount === 1 ? '' : 's'} in trash
                </span>
              </div>
              <span className="text-xs font-medium text-primary">Manage →</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
