import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'FREELANCER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bids = await prisma.bid.findMany({
      where: {
        freelancerId: user.id,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            budget: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ bids });
  } catch (error) {
    console.error('Error fetching freelancer bids:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bids' },
      { status: 500 }
    );
  }
}
