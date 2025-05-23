import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import DashboardLayout from '@/app/dashboard/layout';
import { getDashboardData } from '@/app/dashboard/server';
import DashboardContent from '@/components/dashboard/content';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProjectFormModal from '@/components/projects/project-form-modal';

export default async function ClientDashboard() {
  const user = await getCurrentUser();

  if (!user || user.role !== UserRole.CLIENT) {
    redirect('/login');
  }

  const projects = await prisma.project.findMany({
    where: {
      clientId: user.id,
    },
    include: {
      bids: {
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
  });

  const { contracts, stats } = await getDashboardData();

  return (
      <DashboardContent 
        role={UserRole.CLIENT}
        stats={stats}
        contracts={contracts}
        projects={projects}
      />

  );
}