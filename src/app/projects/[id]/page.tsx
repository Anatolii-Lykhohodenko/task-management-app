import { notFound } from "next/navigation";
import prisma from "@/lib/db/client";

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProjectPage  ({ params } : Props)  {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    select: {
      user: {
        select: {
          name: true,
        },
      },
      name: true,
      createdAt: true
    },
    where: { id: +id },
  });
  
  if (!project) notFound()

  return <div>
    {project.name}: createdAt - {project.createdAt.toDateString()}, owner - {project.user.name}
  </div>;  
}