import { getCurrentUser, hasRole } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const projectSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  budget: z.number().positive(),
  deadline: z.string().optional(),
  skills: z.array(z.string()).optional(),
  category: z.string(),
});

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     description: Returns a list of all projects with optional filtering
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: Filter by project status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by project category
 *       - in: query
 *         name: skill
 *         schema:
 *           type: string
 *         description: Filter by required skill
 *     responses:
 *       200:
 *         description: List of projects
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { clientId: user.id },
          {
            bids: {
              some: {
                freelancerId: user.id
              }
            }
          }
        ]
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        bids: {
          where: {
            freelancerId: user.id
          },
          select: {
            id: true,
            amount: true,
            status: true
          }
        },
        contracts: {
          where: {
            freelancerId: user.id
          },
          select: {
            id: true,
            stage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     description: Creates a new project for the authenticated client
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - budget
 *               - category
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
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authenticated or unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !hasRole(user, UserRole.CLIENT, UserRole.ADMIN)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const result = projectSchema.safeParse(body);

    if (!result.success) {
      return new NextResponse('Invalid request data', { status: 400 });
    }

    const { title, description, budget, skills, category } = result.data;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        budget,
        skills: skills || [],
        category,
        clientId: user.id,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}