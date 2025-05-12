import { getCurrentUser, hasRole } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const proposalSchema = z.object({
  projectId: z.string().uuid(),
  coverLetter: z.string().min(10),
  proposedBudget: z.number().positive(),
  estimatedDays: z.number().int().positive(),
});

/**
 * @swagger
 * /api/proposals:
 *   get:
 *     summary: Get proposals
 *     description: Returns proposals based on user role and filters
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
 *           enum: [PENDING, SHORTLISTED, ACCEPTED, REJECTED]
 *         description: Filter by proposal status
 *     responses:
 *       200:
 *         description: List of proposals
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
    
    // Filter by status if provided
    if (status) {
      where.status = status;
    }
    
    // Filter by user role
    if (user.role === UserRole.FREELANCER) {
      where.freelancerId = user.id;
    } else if (user.role === UserRole.CLIENT) {
      where.project = {
        clientId: user.id,
      };
    }
    
    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            budget: true,
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
            skills: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ proposals }, { status: 200 });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/proposals:
 *   post:
 *     summary: Create a new proposal
 *     description: Creates a new proposal for a project
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - coverLetter
 *               - proposedBudget
 *               - estimatedDays
 *             properties:
 *               projectId:
 *                 type: string
 *                 format: uuid
 *               coverLetter:
 *                 type: string
 *                 minLength: 10
 *               proposedBudget:
 *                 type: number
 *                 minimum: 0
 *               estimatedDays:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Proposal created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authenticated or unauthorized
 *       404:
 *         description: Project not found
 *       409:
 *         description: Proposal already exists
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
    
    if (!hasRole(user, UserRole.FREELANCER)) {
      return NextResponse.json(
        { error: 'Only freelancers can create proposals' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const result = proposalSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }
    
    const { projectId, coverLetter, proposedBudget, estimatedDays } = result.data;
    
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Check if freelancer has already submitted a proposal for this project
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        projectId,
        freelancerId: user.id,
      },
    });
    
    if (existingProposal) {
      return NextResponse.json(
        { error: 'You have already submitted a proposal for this project' },
        { status: 409 }
      );
    }
    
    // Create proposal
    const proposal = await prisma.proposal.create({
      data: {
        projectId,
        freelancerId: user.id,
        coverLetter,
        proposedBudget,
        estimatedDays,
      },
    });
    
    return NextResponse.json(
      { message: 'Proposal submitted successfully', proposal },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}