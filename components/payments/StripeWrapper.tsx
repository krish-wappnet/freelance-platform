'use client'

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentCard } from './PaymentCard';
import { useToast } from '@/hooks/use-toast';

interface StripeWrapperProps {
  contract: any;
}

export function StripeWrapper({ contract }: StripeWrapperProps) {
  const { toast } = useToast();
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
          throw new Error('Stripe publishable key not found');
        }

        const stripe = await loadStripe(publishableKey);
        if (!stripe) {
          throw new Error('Stripe initialization failed');
        }
        setStripePromise(Promise.resolve(stripe));
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to initialize Stripe payment system',
          variant: 'destructive',
        });
        console.error('Stripe initialization error:', error);
      }
    };

    initializeStripe();
  }, [toast]);

  if (!stripePromise) {
    return <div>Loading payment system...</div>;
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentCard contract={contract} />
    </Elements>
  );
}
