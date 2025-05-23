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
    <div className="py-8">
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
                  <p>₹{contract.amount.toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <p className={`font-medium ${
                    contract.stage === 'PROPOSAL' ? 'text-blue-600' :
                    contract.stage === 'APPROVAL' ? 'text-green-600' :
                    contract.stage === 'PAYMENT' ? 'text-yellow-600' :
                    contract.stage === 'REVIEW' ? 'text-purple-600' :
                    contract.stage === 'COMPLETED' ? 'text-gray-600' :
                    'text-red-600'
                  }`}>
                    {contract.stage}
                  </p>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mt-6">
                <h3 className="font-medium mb-2">Terms and Conditions</h3>
                <div className="space-y-2">
                  <p>{contract.terms}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        fetch(`/api/contracts/${params.id}/accept`, {
                          method: 'PUT',
                        })
                        .then(response => {
                          if (!response.ok) {
                            throw new Error('Failed to accept terms');
                          }
                          return response.json();
                        })
                        .then(data => {
                          setContract(data);
                          toast({
                            title: 'Success',
                            description: 'Terms accepted successfully',
                          });
                        })
                        .catch(error => {
                          toast({
                            title: 'Error',
                            description: 'Failed to accept terms',
                            variant: 'destructive',
                          });
                        });
                      }}
                      disabled={contract.termsAccepted}
                    >
                      {contract.termsAccepted ? 'Terms Accepted' : 'Accept Terms'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div className="mt-6">
                <h3 className="font-medium mb-2">Milestones</h3>
                <div className="space-y-4">
                  {contract.milestones.map((milestone: any) => (
                    <div key={milestone.id} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{milestone.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {milestone.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span>₹{milestone.amount.toLocaleString()}</span>
                        <span className={`font-medium ${
                          milestone.status === 'PENDING' ? 'text-blue-600' :
                          milestone.status === 'IN_PROGRESS' ? 'text-yellow-600' :
                          milestone.status === 'COMPLETED' ? 'text-green-600' :
                          milestone.status === 'PAYMENT_REQUESTED' ? 'text-purple-600' :
                          milestone.status === 'PAID' ? 'text-gray-600' :
                          'text-red-600'
                        }`}>
                          {milestone.status}
                        </span>
                      </div>
                    </div>
                  ))}
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
