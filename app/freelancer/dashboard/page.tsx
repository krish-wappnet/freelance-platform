import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { getDashboardData } from '@/app/dashboard/server';
import DashboardContent from '@/components/dashboard/content';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export default async function FreelancerDashboard() {
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

  const { contracts, stats } = await getDashboardData();

  if (!user) {
    redirect('/login');
  }

  return (
      <DashboardContent 
        projects={cleanProjects} 
        contracts={contracts} 
        stats={stats} 
        role="FREELANCER" 
      />
  );
}