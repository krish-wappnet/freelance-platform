'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

    if (paymentIntent && paymentIntentClientSecret) {
      // Payment was successful
      toast.success('Payment completed successfully!');
    } else {
      toast.error('Payment failed or was cancelled');
    }

    // Redirect to dashboard after a short delay
    const timeout = setTimeout(() => {
      router.push('/dashboard');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing Payment</h1>
        <p className="text-gray-600">Please wait while we confirm your payment...</p>
      </div>
    </div>
  );
} 