import CreateProjectForm from '@/components/projects/CreateProjectForm';
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

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 border-b pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Workspace
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Projects
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your projects and open the ones you need.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create project</CardTitle>
          <CardDescription>Add a new workspace project.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateProjectForm />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            All projects
          </h2>
          <p className="text-sm text-muted-foreground">
            {projects.length} total
          </p>
        </div>

        {projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center py-10">
              <p className="text-sm text-muted-foreground">No projects yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="transition-colors hover:bg-muted/40"
              >
                <CardHeader className="space-y-2">
                  <CardTitle className="text-base">
                    <Link
                      href={`/projects/${project.id}`}
                      className="hover:underline"
                    >
                      {project.name}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    Created {project.createdAt.toDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={`/projects/${project.id}`}>Open project</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
