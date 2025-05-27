import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { ContractStage } from '@prisma/client';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total projects
    const totalProjects = await prisma.project.count({
      where: {
        clientId: user.id
      }
    });

    // Get active contracts
    const activeContracts = await prisma.contract.count({
      where: {
        clientId: user.id,
        stage: {
          in: [ContractStage.APPROVAL, ContractStage.PAYMENT, ContractStage.REVIEW]
        }
      }
    });

    // Get total spent
    const payments = await prisma.payment.findMany({
      where: {
        contract: {
          clientId: user.id
        },
        status: 'COMPLETED'
      },
      select: {
        amount: true
      }
    });

    const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return NextResponse.json({
      totalProjects,
      activeContracts,
      totalSpent
    });
  } catch (error) {
    console.error('Error fetching client stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client stats' },
      { status: 500 }
    );
  }
} 