import prisma from '@/lib/db/client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { updateProject } from '@/server/actions/projects';
import { getCurrentUserId } from '@/lib/server/auth';

type Props = { params: Promise<{ projectId: string }> };

export default async function EditProjectPage({ params }: Props) {
  const { projectId } = await params;
  const numericProjectId = Number(projectId);
  const ownerId = await getCurrentUserId();

  if (!ownerId) return null;
  if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) notFound();

  const project = await prisma.project.findUnique({
    where: { id: numericProjectId, ownerId },
    select: { name: true },
  });

  if (!project) notFound();

  return (
    <div className="space-y-5">
      <Link
        href={`/projects/${projectId}`}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to project
      </Link>

      <div className="border-b pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Project
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Edit project
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the project name.
        </p>
      </div>

      <Card className="max-w-lg shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            {project.name}
          </CardTitle>
          <CardDescription className="text-xs">
            Save your changes when you&apos;re done.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            serverAction={updateProject}
            projectId={projectId}
            defaultValues={project}
          />
        </CardContent>
      </Card>
    </div>
  );
}
