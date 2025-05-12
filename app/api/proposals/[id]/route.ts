import { getCurrentUser, hasRole } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { ProposalStatus, UserRole } from '@prisma/client';
import { z } from 'zod';

const updateProposalSchema = z.object({
  coverLetter: z.string().min(10).optional(),
  proposedBudget: z.number().positive().optional(),
  estimatedDays: z.number().int().positive().optional(),
  status: z.enum(['PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED']).optional(),
});

/**
 * @swagger
 * /api/proposals/{id}:
 *   get:
 *     summary: Get proposal by ID
 *     description: Returns a specific proposal by its ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proposal ID
 *     responses:
 *       200:
 *         description: Proposal details
 *       401:
 *         description: Not authenticated or unauthorized
 *       404:
 *         description: Proposal not found
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
    
    const proposal = await prisma.proposal.findUnique({
      where: { id: params.id },
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
    });
    
    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to view this proposal
    if (
      proposal.freelancerId !== user.id &&
      proposal.project.clientId !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { error: 'You are not authorized to view this proposal' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ proposal }, { status: 200 });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/proposals/{id}:
 *   put:
 *     summary: Update proposal
 *     description: Updates a specific proposal
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proposal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coverLetter:
 *                 type: string
 *                 minLength: 10
 *               proposedBudget:
 *                 type: number
 *                 minimum: 0
 *               estimatedDays:
 *                 type: integer
 *                 minimum: 1
 *               status:
 *                 type: string
 *                 enum: [PENDING, SHORTLISTED, ACCEPTED, REJECTED]
 *     responses:
 *       200:
 *         description: Proposal updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authenticated or unauthorized
 *       404:
 *         description: Proposal not found
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
    
    const proposal = await prisma.proposal.findUnique({
      where: { id: params.id },
      include: {
        project: true,
      },
    });
    
    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const result = updateProposalSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }
    
    const { coverLetter, proposedBudget, estimatedDays, status } = result.data;
    
    // Check permissions based on update type
    if (status) {
      // Only clients and admins can update status
      if (
        proposal.project.clientId !== user.id &&
        user.role !== UserRole.ADMIN
      ) {
        return NextResponse.json(
          { error: 'Only the client can update proposal status' },
          { status: 401 }
        );
      }
    } else {
      // Only freelancers and admins can update proposal details
      if (
        proposal.freelancerId !== user.id &&
        user.role !== UserRole.ADMIN
      ) {
        return NextResponse.json(
          { error: 'Only the freelancer can update proposal details' },
          { status: 401 }
        );
      }
      
      // Can't update proposal if it's already been accepted or rejected
      if (
        proposal.status === ProposalStatus.ACCEPTED ||
        proposal.status === ProposalStatus.REJECTED
      ) {
        return NextResponse.json(
          { error: 'Cannot update a proposal that has been accepted or rejected' },
          { status: 400 }
        );
      }
    }
    
    // Update proposal
    const updatedProposal = await prisma.proposal.update({
      where: { id: params.id },
      data: {
        ...(coverLetter && { coverLetter }),
        ...(proposedBudget && { proposedBudget }),
        ...(estimatedDays && { estimatedDays }),
        ...(status && { status: status as ProposalStatus }),
      },
    });
    
    return NextResponse.json(
      { message: 'Proposal updated successfully', proposal: updatedProposal },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating proposal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}