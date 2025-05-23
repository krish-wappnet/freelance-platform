'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentForm } from '../components/PaymentForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Load the Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!); // Assuming environment variable is set

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const milestoneId = searchParams.get('milestoneId');
  const amount = searchParams.get('amount');
  const { toast } = useToast();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!milestoneId || !amount) {
      setError('Milestone ID or amount is missing.');
      setLoading(false);
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount)) {
      setError('Invalid payment amount.');
      setLoading(false);
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ milestoneId, amount: paymentAmount }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent');
        }

        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err.message || 'An error occurred while creating payment intent.');
        console.error('Error creating payment intent:', err);
        toast({
          title: 'Error',
          description: err.message || 'Failed to load payment form',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();

  }, [milestoneId, amount, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Payment Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
      return null;
  }

  const options = { clientSecret };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={options}>
            <PaymentForm milestoneId={milestoneId!} amount={parseFloat(amount!)!} />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
} 