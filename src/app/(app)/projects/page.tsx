import prisma from '@/lib/db/client';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { createProject } from '@/server/actions/projects';
import { getCurrentUserId } from '@/lib/server/auth';
import { notFound } from 'next/navigation';
import { FolderOpen, Plus, Folder, ArrowRight } from 'lucide-react';

export const metadata = { title: 'Projects' };

export default async function ProjectsPage() {
  const userId = await getCurrentUserId();
  if (!userId) notFound();

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { tasks: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your projects and open the ones you need.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Project list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              All projects
            </h2>
            <span className="text-xs text-muted-foreground">
              {projects.length} total
            </span>
          </div>

          {projects.length === 0 ? (
            <Card className="border-dashed shadow-none">
              <CardContent className="flex flex-col items-center justify-center gap-2 py-16">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60">
                  <FolderOpen className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  No projects yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Use the form on the right to create your first project.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="group border-border/50 shadow-none transition-all hover:border-border hover:shadow-sm"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                        <Folder className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm font-semibold">
                          <Link
                            href={`/projects/${project.id}`}
                            className="transition-colors hover:text-primary"
                          >
                            {project.name}
                          </Link>
                        </CardTitle>
                        <CardDescription className="mt-0.5 text-xs">
                          {project._count.tasks === 0
                            ? 'No tasks'
                            : `${project._count.tasks} task${project._count.tasks === 1 ? '' : 's'}`}
                          {' · '}
                          {project.createdAt.toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-7 w-full justify-between px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Link href={`/projects/${project.id}`}>
                        Open project
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Create project */}
        <div>
          <Card className="border-dashed shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">
                    New project
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Add a workspace project.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ProjectForm serverAction={createProject} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
