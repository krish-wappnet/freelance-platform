import { getCurrentUser, hasRole } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { ProjectStatus, UserRole, ContractStage } from '@prisma/client';
import { z } from 'zod';

const updateProjectSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  budget: z.number().positive().optional(),
  deadline: z.string().optional().nullable(),
  skills: z.array(z.string()).optional(),
  category: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     description: Returns a specific project by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
        bids: {
          include: {
            freelancer: {
              select: {
                id: true,
                name: true,
                avatar: true,
                skills: true,
              },
            },
          },
        },
        contracts: {
          include: {
            milestones: true,
          },
        },
      },
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project
 *     description: Updates a specific project
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
 *               title:
 *                 type: string
 *                 minLength: 5
 *               description:
 *                 type: string
 *                 minLength: 10
 *               budget:
 *                 type: number
 *                 minimum: 0
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [OPEN, IN_PROGRESS, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authenticated or unauthorized
 *       404:
 *         description: Project not found
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
    
    // Check if user is the client or admin
    if (project.clientId !== user.id && user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'You can only update your own projects' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const result = updateProjectSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }
    
    const { title, description, budget, deadline, skills, category, status } = result.data;
    
    // Update project
    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(budget && { budget }),
        ...(deadline && { deadline: new Date(deadline) }),
        ...(deadline === null && { deadline: null }),
        ...(skills && { skills }),
        ...(category && { category }),
        ...(status && { status: status as ProjectStatus }),
      },
    });
    
    return NextResponse.json(
      { message: 'Project updated successfully', project: updatedProject },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete project
 *     description: Deletes a specific project
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       401:
 *         description: Not authenticated or unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
export async function DELETE(
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
    
    // Find project
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        bids: true,
        contracts: {
          include: {
            milestones: true,
            payments: true,
          },
        },
      },
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the client or admin
    if (project.clientId !== user.id && user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'You can only delete your own projects' },
        { status: 401 }
      );
    }
    
    // Check if project has contracts in progress
    const hasActiveContracts = project.contracts.some(
      contract => contract.stage === ContractStage.PAYMENT || contract.stage === ContractStage.REVIEW
    );
    
    if (hasActiveContracts) {
      return NextResponse.json(
        { error: 'Cannot delete a project with active contracts' },
        { status: 400 }
      );
    }
    
    // Delete related records first
    for (const contract of project.contracts) {
      // Delete milestones
      await prisma.milestone.deleteMany({
        where: { contractId: contract.id },
      });
      
      // Delete payments
      await prisma.payment.deleteMany({
        where: { contractId: contract.id },
      });
      
      // Delete contract
      await prisma.contract.delete({
        where: { id: contract.id },
      });
    }
    
    // Delete bids
    await prisma.bid.deleteMany({
      where: { projectId: params.id },
    });
    
    // Delete project
    await prisma.project.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json(
      { message: 'Project deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}