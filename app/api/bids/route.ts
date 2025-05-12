import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== UserRole.FREELANCER) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId, amount, deliveryTime, coverLetter } = await request.json();

    // Validate input
    if (!projectId || !amount || !deliveryTime || !coverLetter) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate project exists and is open
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, status: true }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Project is not open for bids' },
        { status: 400 }
      );
    }

    // Create bid
    const bid = await prisma.bid.create({
      data: {
        amount: parseFloat(amount),
        deliveryTime: parseInt(deliveryTime),
        coverLetter,
        status: 'PENDING',
        freelancerId: user.id,
        projectId,
      },
    });

    return NextResponse.json({ bid });
  } catch (error) {
    console.error('Error creating bid:', error);
    return NextResponse.json(
      { error: 'Failed to create bid' },
      { status: 500 }
    );
  }
}
