'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentForm } from '@/app/components/PaymentForm';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get('client_secret');
  const [paymentDetails, setPaymentDetails] = useState<{
    amount: number;
    description: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(`/api/payments/${params.id}`, {
          credentials: 'include',
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch payment details');
        }

        setPaymentDetails({
          amount: data.payment.amount,
          description: `Payment for ${data.payment.milestone?.title || 'Contract'}`,
        });
      } catch (error) {
        toast.error('Failed to load payment details');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!clientSecret || !paymentDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Payment Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Unable to load payment details. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Complete Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-gray-600">Amount: ₹{paymentDetails.amount.toFixed(2)}</p>
            <p className="text-gray-600">{paymentDetails.description}</p>
          </div>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
              },
            }}
          >
            <PaymentForm paymentId={params.id} />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
} 