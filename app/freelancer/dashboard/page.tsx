import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import DashboardLayout from '@/app/dashboard/layout';
import { getDashboardData } from '@/app/dashboard/server';
import DashboardContent from '@/components/dashboard/content';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export default async function FreelancerDashboard() {
  const user = await getCurrentUser();

  if (!hasRole(user, UserRole.FREELANCER)) {
    redirect('/client/dashboard');
  }

  const projects = await prisma.project.findMany({
    where: {
      status: 'OPEN',
    },
    include: {
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
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const { contracts, stats } = await getDashboardData();

  return (
    <DashboardLayout>
      <DashboardContent 
        projects={projects} 
        contracts={contracts} 
        stats={stats} 
        role="FREELANCER" 
      />
    </DashboardLayout>
  );
}