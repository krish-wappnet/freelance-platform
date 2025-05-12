import { getCurrentUser, hasRole } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { ContractStatus, UserRole } from '@prisma/client';
import { z } from 'zod';

const updateContractSchema = z.object({
  terms: z.string().min(10).optional(),
  status: z.enum([
    'PROPOSED',
    'APPROVED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'DISPUTED',
  ]).optional(),
});

/**
 * @swagger
 * /api/contracts/{id}:
 *   get:
 *     summary: Get contract by ID
 *     description: Returns a specific contract by its ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *     responses:
 *       200:
 *         description: Contract details
 *       401:
 *         description: Not authenticated or unauthorized
 *       404:
 *         description: Contract not found
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
    
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            clientId: true,
            status: true,
            client: {
              select: {
                id: true,
                name: true,
                avatar: true,
                email: true,
              },
            },
          },
        },
        proposal: {
          select: {
            id: true,
            freelancerId: true,
            proposedBudget: true,
            estimatedDays: true,
            freelancer: {
              select: {
                id: true,
                name: true,
                avatar: true,
                email: true,
                bio: true,
              },
            },
          },
        },
        milestones: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            payments: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
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
    
    // Check if user is authorized to view this contract
    if (
      contract.proposal.freelancerId !== user.id &&
      contract.project.clientId !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { error: 'You are not authorized to view this contract' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ contract }, { status: 200 });
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
 * /api/contracts/{id}:
 *   put:
 *     summary: Update contract
 *     description: Updates a specific contract
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               terms:
 *                 type: string
 *                 minLength: 10
 *               status:
 *                 type: string
 *                 enum: [PROPOSED, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED, DISPUTED]
 *     responses:
 *       200:
 *         description: Contract updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authenticated or unauthorized
 *       404:
 *         description: Contract not found
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
    
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        project: true,
        proposal: true,
      },
    });
    
    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const result = updateContractSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }
    
    const { terms, status } = result.data;
    
    // Check permissions based on the update
    if (terms) {
      // Only the client or admin can update terms
      if (
        contract.project.clientId !== user.id &&
        user.role !== UserRole.ADMIN
      ) {
        return NextResponse.json(
          { error: 'Only the client can update contract terms' },
          { status: 401 }
        );
      }
      
      // Can't update terms if contract is already in progress
      if (
        contract.status !== ContractStatus.PROPOSED
      ) {
        return NextResponse.json(
          { error: 'Cannot update terms for a contract that is already active' },
          { status: 400 }
        );
      }
    }
    
    if (status) {
      // Status update permissions vary based on status
      if (status === ContractStatus.APPROVED) {
        // Only freelancer can approve
        if (
          contract.proposal.freelancerId !== user.id &&
          user.role !== UserRole.ADMIN
        ) {
          return NextResponse.json(
            { error: 'Only the freelancer can approve a contract' },
            { status: 401 }
          );
        }
        
        // Can only approve from PROPOSED state
        if (contract.status !== ContractStatus.PROPOSED) {
          return NextResponse.json(
            { error: 'Can only approve a contract in PROPOSED state' },
            { status: 400 }
          );
        }
      } else if (status === ContractStatus.COMPLETED) {
        // Only client can mark as completed
        if (
          contract.project.clientId !== user.id &&
          user.role !== UserRole.ADMIN
        ) {
          return NextResponse.json(
            { error: 'Only the client can mark a contract as completed' },
            { status: 401 }
          );
        }
        
        // Can only complete from IN_PROGRESS state
        if (contract.status !== ContractStatus.IN_PROGRESS) {
          return NextResponse.json(
            { error: 'Can only complete a contract in IN_PROGRESS state' },
            { status: 400 }
          );
        }
      } else if (status === ContractStatus.CANCELLED) {
        // Both client and freelancer can cancel
        if (
          contract.project.clientId !== user.id &&
          contract.proposal.freelancerId !== user.id &&
          user.role !== UserRole.ADMIN
        ) {
          return NextResponse.json(
            { error: 'Only the client or freelancer can cancel a contract' },
            { status: 401 }
          );
        }
        
        // Can't cancel a completed contract
        if (contract.status === ContractStatus.COMPLETED) {
          return NextResponse.json(
            { error: 'Cannot cancel a completed contract' },
            { status: 400 }
          );
        }
      }
    }
    
    // If updating to IN_PROGRESS, set start date
    const data: any = {
      ...(terms && { terms }),
      ...(status && { status: status as ContractStatus }),
    };
    
    if (status === ContractStatus.IN_PROGRESS) {
      data.startDate = new Date();
    } else if (status === ContractStatus.COMPLETED) {
      data.endDate = new Date();
    }
    
    // Update contract
    const updatedContract = await prisma.contract.update({
      where: { id: params.id },
      data,
    });
    
    return NextResponse.json(
      { message: 'Contract updated successfully', contract: updatedContract },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}