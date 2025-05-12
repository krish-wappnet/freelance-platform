import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { PaymentService } from '@/lib/payment';
import { prisma } from '@/lib/prisma';

const paymentService = new PaymentService();

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    const { id } = params;

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        freelancer: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Verify user is the client who owns this contract
    if (user.id !== contract.clientId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Create escrow payment
    const clientSecret = await paymentService.createEscrow(
      contract.id,
      contract.amount,
      contract.freelancerId
    );

    return NextResponse.json({ clientSecret });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
