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

    // Get total projects (contracts)
    const totalProjects = await prisma.contract.count({
      where: {
        freelancerId: user.id
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

    // Get completed projects
    const completedProjects = await prisma.contract.count({
      where: {
        freelancerId: user.id,
        stage: ContractStage.COMPLETED
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
        amount: true,
        completedAt: true
      }
    });

    const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate monthly earnings
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const monthlyEarnings = payments
      .filter(payment => payment.completedAt && new Date(payment.completedAt) >= firstDayOfMonth)
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate average project value
    const averageProjectValue = totalProjects > 0 
      ? totalEarnings / totalProjects 
      : 0;

    return NextResponse.json({
      totalProjects,
      activeContracts,
      totalEarnings,
      monthlyEarnings,
      completedProjects,
      averageProjectValue
    });
  } catch (error) {
    console.error('Error fetching freelancer stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch freelancer stats' },
      { status: 500 }
    );
  }
} 