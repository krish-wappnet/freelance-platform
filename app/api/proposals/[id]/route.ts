import { getCurrentUser, hasRole } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { BidStatus, UserRole } from '@prisma/client';
import { z } from 'zod';

const updateBidSchema = z.object({
  coverLetter: z.string().min(10).optional(),
  proposedBudget: z.number().positive().optional(),
  estimatedDays: z.number().int().positive().optional(),
  status: z.enum(['PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED']).optional(),
});

/**
 * @swagger
 * /api/proposals/{id}:
 *   get:
 *     summary: Get bid by ID
 *     description: Returns a specific bid by its ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bid ID
 *     responses:
 *       200:
 *         description: Bid details
 *       401:
 *         description: Not authenticated or unauthorized
 *       404:
 *         description: Bid not found
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
    
    const bid = await prisma.bid.findUnique({
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
    
    if (!bid) {
      return NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to view this bid
    if (
      bid.freelancerId !== user.id &&
      bid.project.clientId !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { error: 'You are not authorized to view this bid' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ bid }, { status: 200 });
  } catch (error) {
    console.error('Error fetching bid:', error);
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
 *     summary: Update bid
 *     description: Updates a specific bid
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bid ID
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
 *         description: Bid updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authenticated or unauthorized
 *       404:
 *         description: Bid not found
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
    
    // Find bid
    const bid = await prisma.bid.findUnique({
      where: { id: params.id },
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
    
    // Check if user is the freelancer who created the bid or admin
    if (bid.freelancerId !== user.id && user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'You can only update your own bids' },
        { status: 401 }
      );
    }
    
    // Can't update bid if it's already been accepted or rejected
    if (
      bid.status === BidStatus.ACCEPTED ||
      bid.status === BidStatus.REJECTED
    ) {
      return NextResponse.json(
        { error: 'Cannot update a bid that has been accepted or rejected' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const result = updateBidSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }
    
    const { coverLetter, proposedBudget, estimatedDays, status } = result.data;
    
    // Update bid
    const updatedBid = await prisma.bid.update({
      where: { id: params.id },
      data: {
        ...(coverLetter && { coverLetter }),
        ...(proposedBudget && { proposedBudget }),
        ...(estimatedDays && { estimatedDays }),
        ...(status && { status: status as BidStatus }),
      },
    });
    
    return NextResponse.json(
      { message: 'Bid updated successfully', bid: updatedBid },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating bid:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}