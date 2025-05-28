import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import stripe from '@/lib/stripe';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const milestone = await prisma.milestone.findUnique({
      where: { id: params.id },
      include: { contract: true }
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    if (milestone.contract.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: milestone.title,
              description: milestone.description,
            },
            unit_amount: Math.round(milestone.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/client/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/client/dashboard?canceled=true`,
    });

    const payment = await prisma.payment.create({
      data: {
        amount: milestone.amount,
        status: 'PENDING',
        milestoneId: milestone.id,
        contractId: milestone.contractId,
        paymentIntentId: stripeSession.payment_intent as string,
        clientId: milestone.contract.clientId,
        freelancerId: milestone.contract.freelancerId
      }
    });

    return NextResponse.json({ 
      url: stripeSession.url,
      redirectUrl: `/client/dashboard`
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 