import CreateProjectForm from '@/components/projects/CreateProjectForm';
import prisma from '@/lib/db/client';
import Link from 'next/link';

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany();

  return (
    <>
      <h1>Projects</h1>
      <ul>
        {projects.map((project) => {
          return (
            <li key={project.id}>
              <Link href={`/projects/${project.id}`}>{project.name}</Link>
            </li>
          );
        })}
      </ul>
      <CreateProjectForm />
    </>
  );
}
