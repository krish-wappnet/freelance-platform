import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // month, week, year
    const startDate = new Date();
    
    // Set start date based on period
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get all completed payments
    const payments = await prisma.payment.findMany({
      where: {
        contract: {
          clientId: user.id
        },
        status: 'COMPLETED',
        completedAt: {
          gte: startDate
        }
      },
      include: {
        milestone: true,
        contract: {
          include: {
            project: true
          }
        }
      },
      orderBy: {
        completedAt: 'asc'
      }
    });

    // Calculate total earnings
    const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Group earnings by date for the graph
    const earningsByDate = payments.reduce((acc: { [key: string]: number }, payment) => {
      const date = payment.completedAt!.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + payment.amount;
      return acc;
    }, {});

    // Get top earning projects
    const projectEarnings = payments.reduce((acc: { [key: string]: number }, payment) => {
      const projectId = payment.contract.project.id;
      acc[projectId] = (acc[projectId] || 0) + payment.amount;
      return acc;
    }, {});

    const topProjects = await Promise.all(
      Object.entries(projectEarnings)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(async ([projectId, amount]) => {
          const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { title: true }
          });
          return {
            projectId,
            title: project?.title || 'Unknown Project',
            amount
          };
        })
    );

    // Calculate average payment amount
    const averagePayment = payments.length > 0 
      ? totalEarnings / payments.length 
      : 0;

    return NextResponse.json({
      totalEarnings,
      averagePayment,
      earningsByDate,
      topProjects,
      paymentCount: payments.length,
      recentPayments: payments.slice(-5).map(payment => ({
        id: payment.id,
        amount: payment.amount,
        date: payment.completedAt,
        milestone: payment.milestone.title,
        project: payment.contract.project.title
      }))
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings data' },
      { status: 500 }
    );
  }
} 