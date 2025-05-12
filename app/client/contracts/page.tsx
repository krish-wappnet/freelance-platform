'use client'

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import PaymentCard from '@/app/client/components/payments/PaymentCard';
import StripeWrapper from '@/app/client/components/payments/StripeWrapper';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/client-auth';
import { useRouter } from 'next/navigation';

interface ContractProps {
  params: {
    id: string;
  };
}

export default function ContractPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await fetch(`/api/contracts/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch contract');
        }
        const data = await response.json();
        setContract(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load contract details',
          variant: 'destructive',
        });
        router.push('/client/contracts');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [params.id, router, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Contract not found</p>
      </div>
    );
  }

  const handlePaymentSuccess = async () => {
    try {
      await fetch(`/api/contracts/${params.id}/payment`, {
        method: 'POST',
      });

      toast({
        title: 'Success',
        description: 'Payment successful!',
      });

      setShowPayment(false);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process payment',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{contract.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">{contract.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Amount:</span>
                  <span className="ml-2">₹{contract.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <span className="ml-2 capitalize">{contract.stage}</span>
                </div>
                <div>
                  <span className="font-medium">Start Date:</span>
                  <span className="ml-2">
                    {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">End Date:</span>
                  <span className="ml-2">
                    {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {contract.stage === 'PAYMENT' && user?.id === contract.clientId && (
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-lg font-semibold">₹{contract.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    This amount will be held in escrow until the work is completed
                  </p>
                </div>
                <Button onClick={() => setShowPayment(true)}>
                  Make Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showPayment && (
          <StripeWrapper
            contractId={params.id}
            amount={contract.amount}
            onPaymentSuccess={handlePaymentSuccess}
          >
            <PaymentCard
              contractId={params.id}
              amount={contract.amount}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </StripeWrapper>
        )}
      </div>
    </div>
  );
}
