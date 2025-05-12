'use client'

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Suspense } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Stripe } from '@stripe/stripe-js';

interface StripeWrapperProps {
  children: React.ReactNode;
  contractId: string;
  amount: number;
  onPaymentSuccess?: () => void;
}

const StripeWrapper = ({ children, contractId, amount, onPaymentSuccess }: StripeWrapperProps) => {
  const { toast } = useToast();
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

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
    <Suspense fallback={<div>Loading payment...</div>}>
      <Elements stripe={stripePromise}>
        {children}
      </Elements>
    </Suspense>
  );
};

export default StripeWrapper;
