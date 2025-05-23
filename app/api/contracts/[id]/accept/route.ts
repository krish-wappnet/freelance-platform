import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, hasRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export async function PUT(
  request: Request,
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

    // Get contract
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        project: true,
        client: true,
        freelancer: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to accept terms
    if (user.id !== contract.clientId && user.id !== contract.freelancerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update contract terms acceptance
    const updatedContract = await prisma.contract.update({
      where: { id: params.id },
      data: {
        termsAccepted: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedContract);
  } catch (error) {
    console.error('Error accepting contract terms:', error);
    return NextResponse.json(
      { error: 'Failed to accept contract terms' },
      { status: 500 }
    );
  }
}
