import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { MilestoneStatus } from '@prisma/client';

export default async function FreelancerMilestonesPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Verify the user is a freelancer
  if (user.role !== 'FREELANCER') {
    return new Response('Forbidden', { status: 403 });
  }

  // Get all milestones for the freelancer
  const milestones = await prisma.milestone.findMany({
    where: {
      contract: {
        freelancerId: user.id,
      },
    },
    include: {
      contract: {
        select: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      dueDate: 'asc',
    },
  });

  const statusBadge = (status: MilestoneStatus) => ({
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    PAYMENT_REQUESTED: 'bg-purple-100 text-purple-800',
    PAID: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }[status]);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl ml-0 md:ml-[200px] lg:ml-[250px]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Milestones</h1>
        <p className="text-muted-foreground">
          Track and manage your project milestones
        </p>
      </div>

      {milestones.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">You don't have any milestones yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {milestones.map((milestone) => (
            <Link href={`/freelancer/milestones/${milestone.id}`} key={milestone.id}>
              <Card className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{milestone.title}</h3>
                      <p className="text-muted-foreground">
                        {milestone.contract?.project?.title || 'Unknown Project'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={statusBadge(milestone.status)}>
                        {milestone.status?.toString().replace(/_/g, ' ') || 'UNKNOWN'}
                      </Badge>
                      {milestone.dueDate && (
                        <span className="text-sm text-muted-foreground">
                          Due: {format(new Date(milestone.dueDate), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
