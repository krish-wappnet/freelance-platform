import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { MilestoneStatus, UserRole, NotificationType } from '@prisma/client';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Prisma {
    interface PrismaPromise<T> extends Promise<T> {}
  }
}

// Define types for our raw query results
interface ContractData {
  id: string;
  freelancerId: string;
  clientId: string;
  freelancer: { id: string; name: string; email: string };
  client: { id: string; name: string; email: string };
  project: { id: string; title: string };
}

interface ProgressUpdateData {
  id: string;
  description: string;
  status: MilestoneStatus;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string };
}

interface MilestoneData {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: Date | null;
  status: MilestoneStatus;
  createdAt: Date;
  updatedAt: Date;
  contractId: string;
  projectId: string;
  contract: ContractData;
  progressUpdates: ProgressUpdateData[];
  [key: string]: any; // Add index signature to allow additional properties
}

type RawMilestoneResult = (MilestoneData & { contract: string })[];

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { progressUpdate, status } = await request.json();

    // Get the milestone with contract and project details
    const milestone = await prisma.milestone.findUnique({
      where: { id: params.id },
      include: {
        contract: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                clientId: true,
                client: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            freelancer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        progressUpdates: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to update this milestone
    if (
      milestone.contract.freelancer.id !== user.id &&
      milestone.contract.project.clientId !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { error: 'You are not authorized to update this milestone' },
        { status: 403 }
      );
    }

    // Create the progress update
    const newProgressUpdate = await prisma.milestoneProgress.create({
      data: {
        description: progressUpdate,
        status: status || milestone.status,
        milestoneId: milestone.id,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update the milestone status if it's different
    if (status && status !== milestone.status) {
      await prisma.milestone.update({
        where: { id: milestone.id },
        data: { status },
      });

      // Create notification for status change
      let notificationTitle = 'Milestone Update';
      let notificationMessage = '';
      let notificationType: NotificationType = 'MILESTONE_UPDATED';

      switch (status) {
        case 'IN_PROGRESS':
          notificationMessage = `Freelancer ${user.name} has started working on milestone: ${milestone.title}`;
          notificationType = 'MILESTONE_UPDATED';
          break;
        case 'COMPLETED':
          notificationMessage = `Freelancer ${user.name} has marked milestone as completed: ${milestone.title}`;
          notificationType = 'MILESTONE_COMPLETED';
          break;
        case 'PAYMENT_REQUESTED':
          notificationMessage = `Freelancer ${user.name} has requested payment for milestone: ${milestone.title}`;
          notificationType = 'PAYMENT_RECEIVED';
          
          // Create payment record
          const payment = await prisma.payment.create({
            data: {
              amount: milestone.amount,
              contractId: milestone.contractId,
              milestoneId: milestone.id,
              status: 'PENDING',
              clientId: milestone.contract.project.clientId,
              freelancerId: milestone.contract.freelancerId
            },
          });

          // Create notification for client
          await prisma.notification.create({
            data: {
              userId: milestone.contract.project.clientId,
              title: 'Payment Request',
              message: `Freelancer ${user.name} has requested payment of $${milestone.amount} for milestone: ${milestone.title}`,
              type: 'PAYMENT_RECEIVED',
              referenceId: payment.id,
              referenceType: 'PAYMENT',
              amount: milestone.amount,
              isRead: false,
            },
          });
          break;
        case 'PAID':
          notificationMessage = `Payment has been released for milestone: ${milestone.title}`;
          notificationType = 'PAYMENT_RECEIVED';
          break;
        default:
          notificationMessage = `Milestone status has been updated to ${status.toLowerCase().replace('_', ' ')}: ${milestone.title}`;
          notificationType = 'MILESTONE_UPDATED';
      }

      // Create notification for status change
      await prisma.notification.create({
        data: {
          userId: milestone.contract.project.clientId,
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
          referenceId: milestone.id,
          referenceType: 'MILESTONE',
          isRead: false,
        },
      });
    }

    // Get the updated milestone with all progress updates
    const updatedMilestone = await prisma.milestone.findUnique({
      where: { id: milestone.id },
      include: {
        contract: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                clientId: true,
                client: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            freelancer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        progressUpdates: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedMilestone);
  } catch (error) {
    console.error('Error updating milestone progress:', error);
    return NextResponse.json(
      { error: 'Failed to update milestone progress' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const milestone = await prisma.milestone.findUnique({
      where: { id: params.id },
      include: {
        contract: {
          select: {
            freelancerId: true,
            clientId: true,
          },
        },
        progressUpdates: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    // Verify the user is either the freelancer or client for this milestone
    const isFreelancer = user.id === milestone.contract.freelancerId;
    const isClient = user.id === milestone.contract.clientId;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isFreelancer && !isClient && !isAdmin) {
      return NextResponse.json(
        { error: 'You are not authorized to view this milestone' },
        { status: 403 }
      );
    }

    return NextResponse.json({ progressUpdates: milestone.progressUpdates });
  } catch (error) {
    console.error('Error fetching milestone progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestone progress' },
      { status: 500 }
    );
  }
}
