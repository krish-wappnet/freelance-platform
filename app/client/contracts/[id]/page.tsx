'use client'

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/client-auth';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { DollarSign, Clock, Calendar, Check, X, Users, Briefcase, FileText, CreditCard, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { RatingDialog } from "@/components/ui/rating-dialog";

interface Contract {
  id: string;
  title: string;
  description: string;
  amount: number;
  stage: string;
  paymentIntentId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  termsAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  clientId: string;
  freelancerId: string;
  bidId: string;
  project: {
    skills: never[];
    id: string;
    title: string;
    description: string;
    budget: number;
    deadline: Date | null;
    status: string;
    clientId: string;
    client: {
      id: string;
      name: string;
      avatar: string | null;
      email: string;
    };
  };
  client: {
    id: string;
    name: string;
    avatar: string | null;
    email: string;
  };
  freelancer: {
    id: string;
    name: string;
    avatar: string | null;
    email: string;
    bio: string | null;
  };
  bid: {
    id: string;
    amount: number;
    deliveryTime: number;
    coverLetter: string;
    freelancer: {
      id: string;
      name: string;
      avatar: string | null;
      email: string;
      bio: string | null;
    };
  };
  milestones: {
    id: string;
    title: string;
    description: string;
    amount: number;
    dueDate: Date | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    contractId: string;
    projectId: string;
  }[];
}

export default function ContractDetailsPage() {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();

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
        console.error('Error fetching contract:', error);
        toast({
          title: 'Error',
          description: 'Failed to load contract',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [params.id, toast]);

  const handleStageChange = async (newStage: string) => {
    if (!contract) return;
    
    try {
      const response = await fetch(`/api/contracts/${contract.id}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!response.ok) {
        throw new Error('Failed to update contract stage');
      }

      const updatedContract = await response.json();
      setContract(updatedContract);
      toast({
        title: 'Success',
        description: `Contract moved to ${newStage} stage`,
      });
    } catch (error) {
      console.error('Error updating contract stage:', error);
      toast({
        title: 'Error',
        description: 'Failed to update contract stage',
        variant: 'destructive',
      });
    }
  };

  const handleTermsAccept = async () => {
    if (!contract) return;
    
    try {
      const response = await fetch(`/api/contracts/${contract.id}/accept`, {
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
    } catch (error) {
      console.error('Error accepting terms:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept terms',
        variant: 'destructive',
      });
    }
  };

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
        <h2 className="text-lg font-medium">Contract not available</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contract Details</h1>
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          Back
        </Button>
      </div>

      <Card className="h-[800px]">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <CardTitle>{contract.title}</CardTitle>
              <CardDescription>
                {contract.project?.title || 'Project details not available'}
              </CardDescription>
            </div>  
            <Badge
              variant="outline"
              className={cn(
                "capitalize",
                contract.stage === "PROPOSAL" && "bg-yellow-500/10 text-yellow-700 border-yellow-300",
                contract.stage === "APPROVAL" && "bg-blue-500/10 text-blue-700 border-blue-300",
                contract.stage === "PAYMENT" && "bg-green-500/10 text-green-700 border-green-300",
                contract.stage === "REVIEW" && "bg-purple-500/10 text-purple-700 border-purple-300",
                contract.stage === "COMPLETED" && "bg-green-500/10 text-green-700 border-green-300",
                contract.stage === "CANCELLED" && "bg-red-500/10 text-red-700 border-red-300",
              )}
            >
              {contract.stage}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">₹{(contract.bid?.amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {contract.startDate ? format(new Date(contract.startDate), 'MMM d, yyyy') : 'Start date not set'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {contract.endDate ? format(new Date(contract.endDate), 'MMM d, yyyy') : 'End date not set'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{contract.stage === 'PROPOSAL' ? 'Terms Pending' : 'Terms Accepted'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {(contract.project?.skills || []).join(', ') || 'No skills specified'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {(contract.milestones?.length || 0) + ' milestone' + (contract.milestones?.length !== 1 ? 's' : '')}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Description</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    {contract.project?.description || 'Project description not available'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{contract.client?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Budget: ₹{contract.project?.budget?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {contract.project?.deadline ? format(new Date(contract.project.deadline), 'MMM d, yyyy') : 'No deadline set'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {(contract.milestones || []).map((milestone) => (
                    <Link href={`/milestones/${milestone.id}`} key={milestone.id}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="font-medium">{milestone.title}</span>
                            <span className="text-sm text-muted-foreground">₹{milestone.amount.toLocaleString()}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {milestone.dueDate ? format(new Date(milestone.dueDate), 'MMM d, yyyy') : 'No due date'}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            milestone.status === "PENDING" && "bg-yellow-500/10 text-yellow-700 border-yellow-300",
                            milestone.status === "COMPLETED" && "bg-green-500/10 text-green-700 border-green-300",
                            milestone.status === "CANCELLED" && "bg-red-500/10 text-red-700 border-red-300",
                          )}
                        >
                          {milestone.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {contract.stage === 'PROPOSAL' && !contract.termsAccepted && (
                <Button
                  variant="default"
                  onClick={handleTermsAccept}
                >
                  Accept Terms
                </Button>
              )}
              {contract.stage === 'PROPOSAL' && contract.termsAccepted && (
                <Button
                  variant="default"
                  onClick={() => handleStageChange('APPROVAL')}
                >
                  Move to Approval
                </Button>
              )}
              {contract.stage === 'APPROVAL' && (
                <Button
                  variant="default"
                  onClick={() => handleStageChange('PAYMENT')}
                >
                  Move to Payment
                </Button>
              )}
              {contract.stage === 'PAYMENT' && (
                <Button
                  variant="default"
                  onClick={() => handleStageChange('REVIEW')}
                >
                  Move to Review
                </Button>
              )}
              {contract.stage === 'REVIEW' && (
                <Button
                  variant="default"
                  onClick={() => handleStageChange('COMPLETED')}
                >
                  Mark as Completed
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Back
            </Button>
          </div>
        </CardFooter>
      </Card>

      {contract.stage === "COMPLETED" && (
        <div className="mt-4">
          <RatingDialog
            contractId={contract.id}
            freelancerId={contract.freelancerId}
            clientId={contract.clientId}
            onSuccess={() => {
              router.refresh();
            }}
          />
        </div>
      )}
    </div>
  );
}
