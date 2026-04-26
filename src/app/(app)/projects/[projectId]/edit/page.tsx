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

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function EditProjectPage({ params }: Props) {
  const { projectId } = await params;

  const numericProjectId = Number(projectId);

  if (!numericProjectId || Number.isNaN(numericProjectId)) notFound();

  const project = await prisma.project.findUnique({
    where: {
      id: numericProjectId,
    },
    select: {
      name: true,
    },
  });

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to project
        </Link>
      </div>

      <div className="border-b pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Project
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Edit project
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update project name
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">{project.name}</CardTitle>
          <CardDescription>Save your changes when you’re done.</CardDescription>
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
