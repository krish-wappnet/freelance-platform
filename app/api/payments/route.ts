import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { PaymentService } from '@/lib/payment';
import { prisma } from '@/lib/prisma';

const paymentService = new PaymentService();

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const { contractId, amount } = await request.json();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        project: {
          select: {
            clientId: true,
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Verify user is the client who owns this contract
    if (user.id !== contract.project.clientId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent(
      amount,
      'inr',
      {
        contractId,
        clientId: user.id,
      }
    );

    return NextResponse.json(paymentIntent);
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    const { contractId, milestoneId } = await request.json();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        project: {
          select: {
            clientId: true,
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Verify user is the client who owns this contract
    if (user.id !== contract.project.clientId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Release escrow for the milestone
    await paymentService.releaseEscrow(contractId, milestoneId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error releasing escrow:', error);
    return NextResponse.json(
      { error: 'Failed to release escrow' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    const { contractId } = await request.json();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        project: {
          select: {
            clientId: true,
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Verify user is the client who owns this contract
    if (user.id !== contract.project.clientId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Refund escrow
    await paymentService.refundEscrow(contractId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error refunding escrow:', error);
    return NextResponse.json(
      { error: 'Failed to refund escrow' },
      { status: 500 }
    );
  }
}
