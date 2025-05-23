import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

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
      currency: 'usd',
      metadata: {
        paymentId: payment.id,
        contractId: payment.contractId,
        milestoneId: payment.milestoneId || '',
      },
    });

    // Update payment with Stripe payment intent ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentIntentId: paymentIntent.id,
        status: 'PROCESSING',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      url: `/payment/${payment.id}?client_secret=${paymentIntent.client_secret}`,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
} 