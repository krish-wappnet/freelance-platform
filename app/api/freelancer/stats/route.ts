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

    // Get total projects (projects where freelancer has bids)
    const totalProjects = await prisma.project.count({
      where: {
        bids: {
          some: {
            freelancerId: user.id
          }
        }
      }
    });

    // Get active contracts
    const activeContracts = await prisma.contract.count({
      where: {
        freelancerId: user.id,
        stage: {
          in: [ContractStage.APPROVAL, ContractStage.PAYMENT, ContractStage.REVIEW]
        }
      }
    });

    // Get total earnings
    const payments = await prisma.payment.findMany({
      where: {
        contract: {
          freelancerId: user.id
        },
        status: 'COMPLETED'
      },
      select: {
        amount: true
      }
    });

    const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return NextResponse.json({
      totalProjects,
      activeContracts,
      totalEarnings
    });
  } catch (error) {
    console.error('Error fetching freelancer stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch freelancer stats' },
      { status: 500 }
    );
  }
} 