import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { formatDistanceToNow } from 'date-fns';

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: Date | null;
  category: string;
  skills: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
  clientId: string;
  bids: {
    id: string;
    amount: number;
    deliveryTime: number;
    coverLetter: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
    freelancerId: string;
    freelancer: {
      name: string;
      avatar: string | null;
    };
  }[];
}

export async function fetchProjects() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'CLIENT') {
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  return projects as Project[];
}
