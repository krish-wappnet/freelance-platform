import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Find the payment by paymentIntentId
      const payment = await prisma.payment.findFirst({
        where: { paymentIntentId: paymentIntent.id },
        include: {
          milestone: {
            include: {
              contract: true
            }
          }
        }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: 'COMPLETED'
        }
      });

      // Update milestone status
      await prisma.milestone.update({
        where: { id: payment.milestoneId },
        data: { 
          status: 'COMPLETED'
        }
      });

      // Create notification for freelancer
      await prisma.notification.create({
        data: {
          userId: payment.milestone.contract.freelancerId,
          type: 'PAYMENT_RECEIVED',
          title: 'Payment Received',
          message: `You have received payment of $${payment.amount} for milestone "${payment.milestone.title}"`,
          referenceId: payment.id,
          referenceType: 'PAYMENT',
          amount: payment.amount
        }
      });

      // Check if all milestones are completed
      const contract = await prisma.contract.findUnique({
        where: { id: payment.contractId },
        include: { milestones: true }
      });

      if (contract && contract.milestones.every(m => m.status === 'COMPLETED')) {
        // Update contract status
        await prisma.contract.update({
          where: { id: contract.id },
          data: { 
            stage: 'COMPLETED',
            endDate: new Date()
          }
        });

        // Create notifications for both parties
        await prisma.notification.createMany({
          data: [
            {
              userId: contract.clientId,
              type: 'CONTRACT_UPDATED',
              title: 'Contract Completed',
              message: `Contract "${contract.title}" has been completed successfully`,
              referenceId: contract.id,
              referenceType: 'CONTRACT'
            },
            {
              userId: contract.freelancerId,
              type: 'CONTRACT_UPDATED',
              title: 'Contract Completed',
              message: `Contract "${contract.title}" has been completed successfully`,
              referenceId: contract.id,
              referenceType: 'CONTRACT'
            }
          ]
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 