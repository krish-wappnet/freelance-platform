import { redirect } from 'next/navigation';
import { getCurrentUser, hasRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import prisma from '@/lib/prisma';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Briefcase,
  FileText,
  CreditCard,
} from 'lucide-react';
import ProjectList from '@/components/projects/project-list';
import ContractList from '@/components/contracts/contract-list';

export async function getDashboardData() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return {
    user,
    projects: await prisma.project.findMany({
      where: {
        bids: {
          some: {
            freelancerId: user.id,
          },
        },
      },
      include: {
        bids: {
          where: {
            freelancerId: user.id,
          },
        },
        contracts: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    }),
    contracts: await prisma.contract.findMany({
      where: {
        bid: {
          freelancerId: user.id,
        },
      },
      include: {
        project: true,
        bid: {
          include: {
            freelancer: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        milestones: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5,
    }),
    stats: {
      totalProjects: await prisma.project.count({
        where: {
          bids: {
            some: {
              freelancerId: user.id,
            },
          },
        },
      }),
      activeProjects: await prisma.project.count({
        where: {
          bids: {
            some: {
              freelancerId: user.id,
            },
          },
          status: 'IN_PROGRESS',
        },
      }),
      totalBids: await prisma.bid.count({
        where: {
          freelancerId: user.id,
        },
      }),
      activeContracts: await prisma.contract.count({
        where: {
          bid: {
            freelancerId: user.id,
          },
          stage: {
            in: ['APPROVAL', 'PAYMENT', 'REVIEW', 'COMPLETED'],
          },
        },
      }),
    },
  };
}
