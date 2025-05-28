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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ContractStage } from '@prisma/client';
import { Clock, Calendar } from 'lucide-react';

interface ContractProps {
  params: {
    id: string;
  };
}

interface Contract {
  id: string;
  title: string;
  description: string;
  amount: number;
  stage: ContractStage;
  paymentIntentId: string | null;
  startDate: string | null;
  endDate: string | null;
  termsAccepted: boolean;
  terms: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  clientId: string;
  freelancerId: string;
  bidId: string;
  project: {
    id: string;
    title: string;
    clientId: string;
    client: {
      id: string;
      name: string;
      avatar: string | null;
    };
  };
  bid: {
    id: string;
    amount: number;
    deliveryTime: number;
    coverLetter: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    freelancer: {
      id: string;
      name: string;
      avatar: string | null;
      bio: string | null;
    };
  };
  milestones: {
    id: string;
    title: string;
    description?: string;
    status: string;
    amount: number;
  }[];
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

  const handleTermsAcceptance = async () => {
    try {
      const response = await fetch(`/api/contracts/${params.id}/accept`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to accept terms');
      }

      const updatedContract = await response.json();
      setContract(updatedContract);
      
      toast({
        title: 'Success',
        description: 'Terms accepted successfully',
      });

      // If this was the last required action, refresh the page to show updated status
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept terms',
        variant: 'destructive',
      });
    }
  };

  const canAcceptTerms = () => {
    return !contract.termsAccepted && contract.stage === 'PROPOSAL';
  };

  const canMakePayment = () => {
    return contract.stage === 'PAYMENT' && 
           user?.id === contract.clientId && 
           contract.termsAccepted;
  };

  const getStageDescription = () => {
    switch (contract.stage) {
      case 'PROPOSAL':
        return 'Review and accept the contract terms to proceed';
      case 'APPROVAL':
        return 'Waiting for freelancer to accept the contract';
      case 'PAYMENT':
        return 'Make the payment to start the project';
      case 'REVIEW':
        return 'Project is in progress';
      case 'COMPLETED':
        return 'Project has been completed';
      case 'CANCELLED':
        return 'Contract has been cancelled';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="py-8">
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold">{contract.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Created on {formatDate(contract.createdAt)}
                </p>
              </div>
              <Badge className={cn(
                'ml-2',
                contract.stage === 'PROPOSAL' ? 'bg-yellow-100 text-yellow-800' :
                contract.stage === 'APPROVAL' ? 'bg-blue-100 text-blue-800' :
                contract.stage === 'PAYMENT' ? 'bg-purple-100 text-purple-800' :
                contract.stage === 'REVIEW' ? 'bg-orange-100 text-orange-800' :
                contract.stage === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              )}>
                {contract.stage}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{getStageDescription()}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Amount
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{contract.amount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {contract.milestones.length} milestones
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'Not started'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'No deadline'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Project Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Project:</span>
                        <span className="text-sm">{contract.project?.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Freelancer:</span>
                        <span className="text-sm">{contract.bid?.freelancer?.name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Terms and Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Terms and Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{contract.description}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={handleTermsAcceptance}
                        disabled={!canAcceptTerms()}
                      >
                        {contract.termsAccepted ? 'Terms Accepted' : 'Accept Terms'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Milestones */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contract.milestones.map((milestone: any) => (
                      <div key={milestone.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{milestone.title}</h4>
                          <Badge className={cn(
                            'ml-2',
                            milestone.status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                            milestone.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                            milestone.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            milestone.status === 'PAYMENT_REQUESTED' ? 'bg-purple-100 text-purple-800' :
                            milestone.status === 'PAID' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          )}>
                            {milestone.status}
                          </Badge>
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {milestone.description}
                          </p>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            ₹{milestone.amount?.toLocaleString() ?? 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {canMakePayment() && (
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
