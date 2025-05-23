import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { MilestoneStatus } from '@prisma/client';

export default async function MilestonesPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get milestones based on user role
  let milestones;
  
  if (user.role === 'FREELANCER') {
    milestones = await prisma.milestone.findMany({
      where: {
        contract: {
          freelancerId: user.id,
        },
      },
      include: {
        contract: {
          include: {
            project: {
              select: {
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
  } else if (user.role === 'CLIENT') {
    milestones = await prisma.milestone.findMany({
      where: {
        contract: {
          clientId: user.id,
        },
      },
      include: {
        contract: {
          include: {
            project: {
              select: {
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
  } else {
    // Admin can see all milestones
    milestones = await prisma.milestone.findMany({
      include: {
        contract: {
          include: {
            project: {
              select: {
                title: true,
              },
            },
            client: {
              select: {
                name: true,
                email: true,
              },
            },
            freelancer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  const statusBadge = (status: MilestoneStatus) => {
    const classes = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      PAYMENT_REQUESTED: 'bg-purple-100 text-purple-800',
      PAID: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }[status];
    
    const labels = {
      PENDING: 'Pending',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      PAYMENT_REQUESTED: 'Payment Requested',
      PAID: 'Paid',
      CANCELLED: 'Cancelled',
    };
    
    return <Badge className={classes}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Milestones</h1>
      </div>
      
      {milestones.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No milestones found</h3>
          <p className="text-muted-foreground mt-2">
            {user.role === 'FREELANCER' 
              ? 'You don\'t have any milestones assigned to you yet.'
              : 'No milestones have been created yet.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {milestones.map((milestone) => (
            <Link href={`/milestones/${milestone.id}`} key={milestone.id}>
              <Card className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{milestone.title}</h3>
                      <p className="text-muted-foreground">
                        {milestone.contract.project.title}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        {statusBadge(milestone.status)}
                        {milestone.dueDate && (
                          <span className="text-sm text-muted-foreground">
                            Due: {format(new Date(milestone.dueDate), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${milestone.amount.toFixed(2)}</div>
                      <Button variant="ghost" size="sm" className="mt-2">
                        View Details
                      </Button>
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