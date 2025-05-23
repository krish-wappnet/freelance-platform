import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { formatDistanceToNow } from 'date-fns';
import ProjectList from '@/app/client/components/projects/ProjectList';
import { fetchProjects } from '@/app/client/components/projects/ProjectServer';

export default async function ClientProjects() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'CLIENT') {
    redirect('/login');
  }

  const projects = await fetchProjects();

  return (
    <div className="p-8">
      <ProjectList projects={projects} />
    </div>
  );
}
