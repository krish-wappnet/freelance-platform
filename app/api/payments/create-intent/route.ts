import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { milestoneId, amount } = await request.json();

    const payment = await prisma.payment.findFirst({
      where: { milestoneId: milestoneId },
      include: {
        contract: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found for this milestone' },
        { status: 404 }
      );
    }

    // Verify the user is the client
    if (payment.contract.project.clientId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'inr',
      metadata: {
        paymentId: payment.id,
        contractId: payment.contractId,
        milestoneId: payment.milestoneId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Created payment intent:', {
      intentId: paymentIntent.id,
      paymentId: payment.id,
      amount: paymentIntent.amount
    });

    // Update payment with Stripe payment intent ID
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentIntentId: paymentIntent.id,
        status: 'PROCESSING',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: updatedPayment.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
} 