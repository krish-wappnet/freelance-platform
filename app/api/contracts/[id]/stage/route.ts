import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, hasRole } from '@/lib/auth';
import { UserRole, ContractStage } from '@prisma/client';

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

    const { stage } = await request.json();

    // Validate stage
    if (!Object.values(ContractStage).includes(stage as ContractStage)) {
      return NextResponse.json(
        { error: 'Invalid contract stage' },
        { status: 400 }
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

    // Check if user is authorized to update stage
    if (user.id !== contract.clientId && user.id !== contract.freelancerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update contract stage
    const updatedContract = await prisma.contract.update({
      where: { id: params.id },
      data: {
        stage: stage as ContractStage,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedContract);
  } catch (error) {
    console.error('Error updating contract stage:', error);
    return NextResponse.json(
      { error: 'Failed to update contract stage' },
      { status: 500 }
    );
  }
}
