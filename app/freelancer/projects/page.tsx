import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import FreelancerProjectList from '@/app/client/components/projects/FreelancerProjectList';
import Sidebar from '@/components/dashboard/sidebar';

export default async function FreelancerProjects() {
  const user = await getCurrentUser();

  if (!user || !hasRole(user, UserRole.FREELANCER)) {
    redirect('/client/dashboard');
  }

  const projects = await prisma.project.findMany({
    where: {
      AND: [
        { status: 'OPEN' },
        {
          bids: {
            none: {
              freelancerId: user.id,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      budget: true,
      deadline: true,
      category: true,
      skills: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      clientId: true,
      bids: {
        where: {
          status: 'PENDING',
        },
        include: {
          freelancer: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
      client: {
        select: {
          name: true,
          avatar: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Convert project IDs to strings
  const cleanProjects = projects.map(project => ({
    ...project,
    id: project.id.toString()
  }));

  const activePath = '/freelancer/projects';

  return (
    <div className="flex h-screen">
      <Sidebar user={user} role="FREELANCER" activePath={activePath} />
      <div className="flex-1 p-8 ml-64">
        <div className="container">
          <FreelancerProjectList projects={cleanProjects} />
        </div>
      </div>
    </div>
  );
}

