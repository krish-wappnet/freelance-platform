import { getCurrentUser, hasRole } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { MilestoneStatus, UserRole, type Milestone, type Contract, type Project } from '@prisma/client';
import { z } from 'zod';

type MilestoneWithRelations = Milestone & {
  contract: Contract & {
    project: Project & {
      client: { id: string; name: string };
    };
    bid?: { id: string; freelancerId: string };
    freelancer: { id: string; name: string; email: string; };
  };
  progressUpdates: Array<{
    id: string;
    description: string;
    status: MilestoneStatus;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    milestoneId: string;
    user: { id: string; name: string; email: string; };
  }>;
  project: { id: string; title: string };
  payments: Array<{ id: string; status: string }>;
};

const updateMilestoneSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  amount: z.number().positive().optional(),
  dueDate: z.string().optional().nullable(),
  status: z.enum([
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'PAYMENT_REQUESTED',
    'PAID'
  ]).optional(),
});

/**
 * @swagger
 * /api/milestones/{id}:
 *   get:
 *     summary: Get milestone by ID
 *     description: Returns a specific milestone by its ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Milestone ID
 *     responses:
 *       200:
 *         description: Milestone details
 *       401:
 *         description: Not authenticated or unauthorized
 *       404:
 *         description: Milestone not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  request: NextRequest,
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
                  },
                },
              },
            },
            bid: {
              select: {
                id: true,
                freelancerId: true,
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
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        payments: true,
      },
    }) as unknown as MilestoneWithRelations | null;
    
    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to view this milestone
    if (
      milestone.contract.freelancerId !== user.id &&
      milestone.contract.project.clientId !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { error: 'You are not authorized to view this milestone' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ milestone }, { status: 200 });
  } catch (error) {
    console.error('Error fetching milestone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/milestones/{id}:
 *   put:
 *     summary: Update milestone
 *     description: Updates a specific milestone
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Milestone ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *               description:
 *                 type: string
 *                 minLength: 10
 *               amount:
 *                 type: number
 *                 minimum: 0
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED, APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: Milestone updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authenticated or unauthorized
 *       404:
 *         description: Milestone not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(
  request: NextRequest,
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
          include: {
            project: {
              select: {
                id: true,
                clientId: true,
              },
            },
            freelancer: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    }) as unknown as (Milestone & {
      contract: Contract & {
        project: { id: string; clientId: string };
        freelancer: { id: string };
      };
    }) | null;
    
    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const result = updateMilestoneSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }
    
    const { title, description, amount, dueDate, status } = result.data;
    
    // Check permissions based on update type
    if (status) {
      if (status === MilestoneStatus.IN_PROGRESS) {
        // Freelancer starts work on milestone
        if (
          milestone.contract.freelancer.id !== user.id &&
          user.role !== UserRole.ADMIN
        ) {
          return NextResponse.json(
            { error: 'Only the freelancer can start working on a milestone' },
            { status: 401 }
          );
        }
        
        if (milestone.status !== MilestoneStatus.PENDING) {
          return NextResponse.json(
            { error: 'Can only start working on a PENDING milestone' },
            { status: 400 }
          );
        }
      } else if (status === MilestoneStatus.COMPLETED) {
        // Freelancer marks milestone as completed
        if (
          milestone.contract.freelancer.id !== user.id &&
          user.role !== UserRole.ADMIN
        ) {
          return NextResponse.json(
            { error: 'Only the freelancer can mark a milestone as completed' },
            { status: 401 }
          );
        }
        
        if (milestone.status !== MilestoneStatus.IN_PROGRESS) {
          return NextResponse.json(
            { error: 'Can only complete an IN_PROGRESS milestone' },
            { status: 400 }
          );
        }
      } else if (status === 'PAYMENT_REQUESTED') {
        // Freelancer requests payment for completed milestone
        if (
          milestone.contract.freelancer.id !== user.id &&
          user.role !== UserRole.ADMIN
        ) {
          return NextResponse.json(
            { error: 'Only the freelancer can request payment for a milestone' },
            { status: 401 }
          );
        }
        
        if (milestone.status !== MilestoneStatus.COMPLETED) {
          return NextResponse.json(
            { error: 'Can only request payment for a COMPLETED milestone' },
            { status: 400 }
          );
        }
      }
    } else {
      // For non-status updates, only client can update milestone details
      if (
        milestone.contract.project.clientId !== user.id &&
        user.role !== UserRole.ADMIN
      ) {
        return NextResponse.json(
          { error: 'Only the client can update milestone details' },
          { status: 401 }
        );
      }
      
      // Can't update details of in-progress or completed milestones
      if (
        milestone.status !== MilestoneStatus.PENDING
      ) {
        return NextResponse.json(
          { error: 'Cannot update details of a milestone that is already in progress or completed' },
          { status: 400 }
        );
      }
    }
    
    // Update milestone
    const updatedMilestone = await prisma.milestone.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(amount && { amount }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(dueDate === null && { dueDate: null }),
        ...(status && { status: status as MilestoneStatus }),
      },
    });
    
    // If milestone payment is requested, update the status
    if (status === 'PAYMENT_REQUESTED') {
      // The actual payment processing would happen in a separate flow
      // We just update the status here to indicate payment was requested
      await prisma.milestone.update({
        where: { id: params.id },
        data: { status: 'PAYMENT_REQUESTED' },
      });
    }
    
    return NextResponse.json(
      { message: 'Milestone updated successfully', milestone: updatedMilestone },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}