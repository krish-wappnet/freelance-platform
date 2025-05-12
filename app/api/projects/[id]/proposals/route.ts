import { getCurrentUser, hasRole } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const proposalSchema = z.object({
  amount: z.number().positive(),
  deliveryTime: z.number().positive(),
  coverLetter: z.string().min(10),
});

/**
 * @swagger
 * /api/projects/{id}/proposals:
 *   post:
 *     summary: Submit a proposal for a project
 *     description: Submit a proposal to work on a project
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0
 *               deliveryTime:
 *                 type: number
 *                 minimum: 0
 *               coverLetter:
 *                 type: string
 *                 minLength: 10
 *     responses:
 *       201:
 *         description: Proposal submitted successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authenticated or unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !hasRole(user, UserRole.FREELANCER)) {
      return NextResponse.json(
        { error: 'Not authenticated or unauthorized' },
        { status: 401 }
      );
    }

    // Find project
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user has already submitted a bid
    const existingBid = await prisma.bid.findFirst({
      where: {
        projectId: params.id,
        freelancerId: user.id,
      },
    });

    if (existingBid) {
      return NextResponse.json(
        { error: 'You have already submitted a bid for this project' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const result = proposalSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    // Create bid
    const bid = await prisma.bid.create({
      data: {
        amount: result.data.amount,
        deliveryTime: result.data.deliveryTime,
        coverLetter: result.data.coverLetter,
        status: 'PENDING',
        projectId: params.id,
        freelancerId: user.id,
      },
    });

    return NextResponse.json({ bid }, { status: 201 });
  } catch (error) {
    console.error('Error submitting proposal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
