'use client'

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/client-auth';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Clock, Calendar } from 'lucide-react';
import { UserRole, ContractStage } from '@prisma/client';
import { cn, formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

export default function FreelancerContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch('/api/contracts');
        
        if (!response.ok) {
          throw new Error('Failed to fetch contracts');
        }

        const data = await response.json();
        
        if (!data?.contracts) {
          throw new Error('Invalid API response');
        }

        // For debugging, log the data and user info
        console.log('API Response:', data);
        console.log('User:', user);

        // Temporarily show all contracts to verify data
        setContracts(data.contracts);

        // Uncomment this when filtering is working
        // const filteredContracts = data.contracts.filter((contract: Contract) => contract.freelancerId === user.id);
        // setContracts(filteredContracts);

      } catch (error) {
        console.error('Error fetching contracts:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load contracts',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [toast]);

  const getStageColor = (stage: ContractStage) => {
    switch (stage) {
      case ContractStage.PROPOSAL:
        return 'bg-yellow-100 text-yellow-800';
      case ContractStage.APPROVAL:
        return 'bg-blue-100 text-blue-800';
      case ContractStage.PAYMENT:
        return 'bg-purple-100 text-purple-800';
      case ContractStage.REVIEW:
        return 'bg-orange-100 text-orange-800';
      case ContractStage.COMPLETED:
        return 'bg-green-100 text-green-800';
      case ContractStage.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTermsAcceptance = async (contractId: string) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}/accept`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to accept terms');
      }

      const updatedContract = await response.json();
      setContracts(contracts.map(c => c.id === contractId ? updatedContract : c));
      
      toast({
        title: 'Success',
        description: 'Terms accepted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept terms',
        variant: 'destructive',
      });
    }
  };

  const canAcceptTerms = (contract: Contract) => {
    return !contract.termsAccepted && 
           contract.stage === 'APPROVAL' && 
           contract.freelancerId === user?.id;
  };

  const getStageDescription = (stage: ContractStage) => {
    switch (stage) {
      case ContractStage.PROPOSAL:
        return 'Client is reviewing the contract terms';
      case ContractStage.APPROVAL:
        return 'Review and accept the contract terms';
      case ContractStage.PAYMENT:
        return 'Waiting for client payment';
      case ContractStage.REVIEW:
        return 'Project is in progress';
      case ContractStage.COMPLETED:
        return 'Project has been completed';
      case ContractStage.CANCELLED:
        return 'Contract has been cancelled';
      default:
        return '';
    }
  };

  const getActionButton = (contract: Contract) => {
    if (canAcceptTerms(contract)) {
      return (
        <Button
          variant="outline"
          onClick={() => handleTermsAcceptance(contract.id)}
        >
          Accept Terms
        </Button>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Contracts</h1>
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{contracts.length} contracts</span>
        </div>
      </div>
      {contracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Contracts Yet</h2>
          <p className="text-muted-foreground text-center">
            Start by finding projects and submitting bids to get contracts.
          </p>
          <Button
            onClick={() => window.location.href = '/freelancer/projects'}
            className="mt-4"
          >
            Find Projects
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{contract.title}</span>
                        <span className="text-xs text-muted-foreground">
                          Created: {formatDate(contract.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">₹{contract.amount.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">
                          {contract.milestones.length} milestones
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{contract.project?.client?.name || 'N/A'}</span>
                        <span className="text-xs text-muted-foreground">
                          {contract.project?.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={getStageColor(contract.stage)}>
                          {contract.stage}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {getStageDescription(contract.stage)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">
                            {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'Not started'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">
                            {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'No deadline'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {getActionButton(contract)}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline">View Details</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <DialogTitle className="text-2xl font-bold">{contract.title}</DialogTitle>
                                  <DialogDescription className="text-muted-foreground mt-1">
                                    Created on {formatDate(contract.createdAt)}
                                  </DialogDescription>
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
                            </DialogHeader>

                            <div className="grid gap-6 py-4">
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
                                        <span className="text-sm font-medium">Client:</span>
                                        <span className="text-sm">{contract.project?.client?.name}</span>
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
                                  <p className="text-sm text-muted-foreground">{contract.description}</p>
                                  {canAcceptTerms(contract) && (
                                    <Button
                                      className="mt-4"
                                      onClick={() => handleTermsAcceptance(contract.id)}
                                    >
                                      Accept Terms
                                    </Button>
                                  )}
                                </CardContent>
                              </Card>

                              {/* Milestones */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Milestones</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    {contract.milestones.map((milestone) => (
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
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
