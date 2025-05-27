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
      console.log('Received webhook event:', event.type);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Processing payment intent:', {
        id: paymentIntent.id,
        metadata: paymentIntent.metadata,
        amount: paymentIntent.amount,
        status: paymentIntent.status
      });
      
      // Try to find the payment by paymentIntentId first
      let payment = await prisma.payment.findFirst({
        where: { 
          paymentIntentId: paymentIntent.id 
        },
        include: {
          milestone: {
            include: {
              contract: true
            }
          }
        }
      });

      // If not found by paymentIntentId, try to find by paymentId from metadata
      if (!payment && paymentIntent.metadata.paymentId) {
        payment = await prisma.payment.findUnique({
          where: { 
            id: paymentIntent.metadata.paymentId 
          },
          include: {
            milestone: {
              include: {
                contract: true
              }
            }
          }
        });

        // If found by paymentId but paymentIntentId is not set, update it
        if (payment && !payment.paymentIntentId) {
          payment = await prisma.payment.update({
            where: { id: payment.id },
            data: { paymentIntentId: paymentIntent.id },
            include: {
              milestone: {
                include: {
                  contract: true
                }
              }
            }
          });
        }
      }

      if (!payment) {
        console.error('Payment not found for payment intent:', {
          intentId: paymentIntent.id,
          metadata: paymentIntent.metadata
        });
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        );
      }

      console.log('Found payment:', {
        id: payment.id,
        intentId: payment.paymentIntentId,
        status: payment.status,
        amount: payment.amount
      });

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

      console.log('Updated payment status:', {
        id: updatedPayment.id,
        status: updatedPayment.status,
        completedAt: updatedPayment.completedAt
      });

      // Update milestone status
      const updatedMilestone = await prisma.milestone.update({
        where: { id: payment.milestoneId },
        data: { 
          status: 'PAID'
        }
      });

      console.log('Updated milestone status:', {
        id: updatedMilestone.id,
        status: updatedMilestone.status
      });

      // Create notification for freelancer
      await prisma.notification.create({
        data: {
          userId: payment.milestone.contract.freelancerId,
          type: 'PAYMENT_RECEIVED',
          title: 'Payment Received',
          message: `You have received payment of ₹${payment.amount} for milestone "${payment.milestone.title}"`,
          referenceId: payment.id,
          referenceType: 'PAYMENT',
          amount: payment.amount,
          isRead: false
        }
      });

      // Check if all milestones are completed
      const contract = await prisma.contract.findUnique({
        where: { id: payment.contractId },
        include: { milestones: true }
      });

      if (contract && contract.milestones.every(m => m.status === 'PAID')) {
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
              type: 'CONTRACT_COMPLETED',
              title: 'Contract Completed',
              message: `Contract "${contract.title}" has been completed successfully`,
              referenceId: contract.id,
              referenceType: 'CONTRACT',
              isRead: false
            },
            {
              userId: contract.freelancerId,
              type: 'CONTRACT_COMPLETED',
              title: 'Contract Completed',
              message: `Contract "${contract.title}" has been completed successfully`,
              referenceId: contract.id,
              referenceType: 'CONTRACT',
              isRead: false
            }
          ]
        });
      }

      console.log('Successfully processed payment intent:', paymentIntent.id);
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