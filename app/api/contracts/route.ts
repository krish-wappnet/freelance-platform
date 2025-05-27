import { getCurrentUser, hasRole } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole, ContractStage } from '@prisma/client';
import { z } from 'zod';

const contractSchema = z.object({
  bidId: z.string().uuid(),
  terms: z.string().min(10),
  amount: z.number().positive(),
  milestones: z.array(
    z.object({
      title: z.string().min(2),
      description: z.string().min(10),
      amount: z.number().positive(),
      dueDate: z.string().optional(),
    })
  ).min(1),
}).refine(
  (data) => {
    const totalMilestoneAmount = data.milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
    return Math.abs(totalMilestoneAmount - data.amount) < 0.01; // Allow for small floating point differences
  },
  {
    message: 'The sum of milestone amounts must equal the total contract amount',
    path: ['milestones'],
  }
);

/**
 * @swagger
 * /api/contracts:
 *   get:
 *     summary: Get contracts
 *     description: Returns contracts based on user role and filters
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PROPOSED, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED, DISPUTED]
 *         description: Filter by contract status
 *     responses:
 *       200:
 *         description: List of contracts
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    
    const where: any = {};
    
    // Filter by project if provided
    if (projectId) {
      where.projectId = projectId;
    }
    
    // Filter by stage if provided
    if (status) {
      where.stage = status;
    }
    
    // Filter by user role
    if (user.role === UserRole.FREELANCER) {
      where.freelancerId = user.id;
    } else if (user.role === UserRole.CLIENT) {
      where.clientId = user.id;
    }
    
    const contracts = await prisma.contract.findMany({
      where: {
        OR: [
          { clientId: user.id },
          { freelancerId: user.id }
        ]
      },
      include: {
        project: {
          select: {
            id: true,
            title: true
          }
        },
        bid: {
          select: {
            freelancer: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        milestones: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    return NextResponse.json({ contracts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contracts/{id}:
 *   get:
 *     summary: Get a single contract
 *     description: Returns a single contract by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Contract ID
 *     responses:
 *       200:
 *         description: Contract details
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Contract not found
 *       500:
 *         description: Internal server error
 */
export async function GET_BY_ID(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            skills: true,
            clientId: true,
            client: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        bid: {
          select: {
            id: true,
            amount: true,
            deliveryTime: true,
            coverLetter: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            freelancer: {
              select: {
                id: true,
                name: true,
                avatar: true,
                bio: true,
              },
            },
          },
        },
        milestones: {
          select: {
            id: true,
            title: true,
            description: true,
            amount: true,
            dueDate: true,
            status: true,
          },
        },
      },
    });
    
    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this contract
    if (user.role === UserRole.FREELANCER && contract.freelancerId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (user.role === UserRole.CLIENT && contract.clientId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(contract, { status: 200 });
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contracts:
 *   post:
 *     summary: Create a new contract
 *     description: Creates a new contract based on a proposal
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proposalId
 *               - terms
 *               - totalAmount
 *               - milestones
 *             properties:
 *               proposalId:
 *                 type: string
 *                 format: uuid
 *               terms:
 *                 type: string
 *                 minLength: 10
 *               totalAmount:
 *                 type: number
 *                 minimum: 0
 *               milestones:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                     - description
 *                     - amount
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     dueDate:
 *                       type: string
 *                       format: date-time
 *     responses:
 *       201:
 *         description: Contract created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authenticated or unauthorized
 *       404:
 *         description: Proposal not found
 *       409:
 *         description: Contract already exists
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (!hasRole(user, UserRole.CLIENT, UserRole.ADMIN)) {
      return NextResponse.json(
        { error: 'Only clients can create contracts' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const result = contractSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }
    
    const { bidId, terms, milestones } = result.data;
    
    // Check if bid exists
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        project: true,
        freelancer: true,
      },
    });

    if (!bid) {
      return NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      );
    }
    

    
    // Check if user owns the project
    if (
      bid.project.clientId !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { error: 'You can only create contracts for your own projects' },
        { status: 401 }
      );
    }
    
    // Check if contract already exists using bidId
    const existingContract = await prisma.contract.findFirst({
      where: {
        bidId: bidId
      },
      include: {
        bid: true
      }
    });

    if (existingContract) {
      // If contract exists but has no bidId, update it with the bidId
      if (!existingContract.bidId) {
        await prisma.contract.update({
          where: { id: existingContract.id },
          data: { bidId: bidId }
        });
        return NextResponse.json(
          { error: 'Contract updated with bid information' },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { error: 'A contract already exists for this bid' },
        { status: 409 }
      );
    }
    
    // Check milestone amounts total
    const milestoneTotalAmount = milestones.reduce(
      (total, milestone) => total + milestone.amount,
      0
    );
    
    if (Math.abs(milestoneTotalAmount - result.data.amount) > 0.01) {
      return NextResponse.json(
        { error: 'The sum of milestone amounts must equal the total contract amount' },
        { status: 400 }
      );
    }
    
    // Create contract with milestones in a transaction
    const contract = await prisma.$transaction(async (tx) => {
      // Create contract
      const newContract = await tx.contract.create({
        data: {
          projectId: bid.projectId,
          clientId: user.id,
          freelancerId: bid.freelancerId,
          bidId: bid.id,
          title: bid.project.title,
          description: terms,
          amount: result.data.amount,
          stage: ContractStage.PROPOSAL,
          milestones: {
            create: milestones.map(milestone => ({
              title: milestone.title,
              description: milestone.description,
              amount: milestone.amount,
              dueDate: milestone.dueDate ? new Date(milestone.dueDate) : undefined,
              status: 'PENDING',
              project: {
                connect: {
                  id: bid.projectId
                }
              },
              freelancer: {
                connect: {
                  id: bid.freelancerId
                }
              }
            }))
          }
        },
        include: {
          project: true,
          bid: true,
          milestones: true
        }
      });
      
      return newContract;
    });
    
    return NextResponse.json(
      { message: 'Contract created successfully', contract },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}