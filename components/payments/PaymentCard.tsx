'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
interface PaymentCardProps {
  contract: {
    id: string;
    amount: number;
    paymentStatus: string;
    milestones: any[];
    freelancer: {
      stripeAccountId: string;
    };
  };
}

export function PaymentCard({ contract }: PaymentCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/contracts/${contract.id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = `https://checkout.stripe.com/c/pay/${sessionId}`;
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'An error occurred. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Contract Amount:</span>
            <span>${contract.amount}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={contract.paymentStatus === 'PAID' ? 'text-green-600' : 'text-gray-600'}>
              {contract.paymentStatus}
            </span>
          </div>
          {contract.paymentStatus !== 'PAID' && (
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Processing...' : 'Make Payment'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
