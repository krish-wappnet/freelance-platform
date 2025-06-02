import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { BidStatus, UserRole } from '@prisma/client';
import { z } from 'zod';

const createBidSchema = z.object({
  projectId: z.string(),
  coverLetter: z.string().min(10),
  amount: z.number().positive(),
  deliveryTime: z.number().int().positive(),
});

/**
 * @swagger
 * /api/proposals:
 *   post:
 *     summary: Create a new bid
 *     description: Creates a new bid for a project
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: string
 *               coverLetter:
 *                 type: string
 *                 minLength: 10
 *               amount:
 *                 type: number
 *                 minimum: 0
 *               deliveryTime:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Bid created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authenticated or unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Only freelancers can create bids
    if (user.role !== UserRole.FREELANCER) {
      return NextResponse.json(
        { error: 'Only freelancers can create bids' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const validatedData = createBidSchema.parse(body);
    
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Check if project is open
    if (project.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Project is not open for bids' },
        { status: 400 }
      );
    }
    
    // Check if freelancer has already bid on this project
    const existingBid = await prisma.bid.findFirst({
      where: {
        projectId: validatedData.projectId,
        freelancerId: user.id,
      },
    });
    
    if (existingBid) {
      return NextResponse.json(
        { error: 'You have already bid on this project' },
        { status: 400 }
      );
    }
    
    // Create bid
    const bid = await prisma.bid.create({
      data: {
        projectId: validatedData.projectId,
        freelancerId: user.id,
        coverLetter: validatedData.coverLetter,
        amount: validatedData.amount,
        deliveryTime: validatedData.deliveryTime,
        status: BidStatus.PENDING,
      },
    });
    
    return NextResponse.json(bid, { status: 201 });
  } catch (error) {
    console.error('Error creating bid:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/proposals:
 *   get:
 *     summary: Get all bids
 *     description: Returns all bids with optional filtering
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter bids by project ID
 *       - in: query
 *         name: freelancerId
 *         schema:
 *           type: string
 *         description: Filter bids by freelancer ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, SHORTLISTED, ACCEPTED, REJECTED]
 *         description: Filter bids by status
 *     responses:
 *       200:
 *         description: List of bids
 *       401:
 *         description: Not authenticated or unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const freelancerId = searchParams.get('freelancerId');
    const status = searchParams.get('status') as BidStatus | null;
    
    // Build where clause based on user role and filters
    const where: any = {};
    
    if (projectId) {
      where.projectId = projectId;
    }
    
    if (freelancerId) {
      where.freelancerId = freelancerId;
    }
    
    if (status) {
      where.status = status;
    }
    
    // If user is a freelancer, they can only see their own bids
    if (user.role === UserRole.FREELANCER) {
      where.freelancerId = user.id;
    }
    
    // If user is a client, they can only see bids for their projects
    if (user.role === UserRole.CLIENT) {
      where.project = {
        clientId: user.id,
      };
    }
    
    const bids = await prisma.bid.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            budget: true,
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
        freelancer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            skills: true,
          },
        },
        contract: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(bids);
  } catch (error) {
    console.error('Error fetching bids:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}