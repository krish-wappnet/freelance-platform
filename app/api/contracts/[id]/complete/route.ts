import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { ContractStage } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contractId = params.id;

    // Get the contract with project details
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        project: true,
        milestones: true
      }
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Check if all milestones are completed
    const allMilestonesCompleted = contract.milestones.every(
      milestone => milestone.status === 'COMPLETED'
    );

    if (!allMilestonesCompleted) {
      return NextResponse.json(
        { error: 'All milestones must be completed before ending the contract' },
        { status: 400 }
      );
    }

    // Update contract and project status in a transaction
    const updatedContract = await prisma.$transaction(async (tx) => {
      // Update contract status
      const updatedContract = await tx.contract.update({
        where: { id: contractId },
        data: {
          stage: ContractStage.COMPLETED
        }
      });

      // Update project status
      await tx.project.update({
        where: { id: contract.project.id },
        data: {
          status: 'COMPLETED'
        }
      });

      return updatedContract;
    });

    return NextResponse.json(updatedContract);
  } catch (error) {
    console.error('Error completing contract:', error);
    return NextResponse.json(
      { error: 'Failed to complete contract' },
      { status: 500 }
    );
  }
} 