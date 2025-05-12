import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import stripe from '@/lib/stripe';

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = stripe;
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'inr',
    metadata: Record<string, string> = {}
  ): Promise<PaymentIntent> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
    });

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency!,
      status: paymentIntent.status,
    };
  }

  async verifyPayment(paymentIntentId: string): Promise<boolean> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  }

  async createEscrow(
    contractId: string,
    amount: number,
    freelancerId: string
  ): Promise<string> {
    // Create a payment intent for the total contract amount
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: 'inr',
      metadata: {
        contractId,
        freelancerId,
      },
    });

    // Update the contract with the payment intent ID
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        paymentIntentId: paymentIntent.id,
      },
    });

    return paymentIntent.client_secret!;
  }

  async releaseEscrow(
    contractId: string,
    milestoneId: string
  ): Promise<void> {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        milestones: true,
        freelancer: true,
      },
    }) as any;

    if (!contract) {
      throw new Error('Contract not found');
    }

    const milestone = contract.milestones.find((m: any) => m.id === milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    // Create a transfer to the freelancer's account
    await this.stripe.transfers.create({
      amount: milestone.amount,
      currency: 'inr',
      destination: contract.freelancer.stripeAccountId!,
      source_transaction: contract.paymentIntentId!,
    });

    // Update the milestone status
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'PAID',
      },
    });
  }

  async refundEscrow(contractId: string): Promise<void> {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      select: {
        paymentIntentId: true,
      },
    }) as any;

    if (!contract) {
      throw new Error('Contract not found');
    }

    // Create a refund for the payment intent
    await this.stripe.refunds.create({
      payment_intent: contract.paymentIntentId!,
    });

    // Update the contract status
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        stage: 'CANCELLED',
      },
    });
  }
}
