'use client'

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, DollarSign, Clock, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/client-auth';
import { Badge } from '@/components/ui/badge';
import { UserRole, ContractStage } from '@prisma/client';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RatingDialog } from '@/components/ui/rating-dialog';
import { useRouter } from 'next/navigation';

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
    status: string;
    amount: number;
  }[];
}

export default function ClientContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch('/api/client/contracts');
        
        if (!response.ok) {
          throw new Error('Failed to fetch contracts');
        }

        const data = await response.json();
        
        // For debugging, log the data and user info
        console.log('API Response:', data);

        setContracts(data);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Contracts</h1>
          <p className="text-muted-foreground">Manage your active contracts and payments</p>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{contracts.length} contracts</span>
        </div>
      </div>

      {contracts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Contracts Yet</h2>
            <p className="text-muted-foreground text-center mb-4">
              You haven't created any contracts yet.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/client/projects'}>
              Browse Projects
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Title</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Freelancer</TableHead>
                <TableHead>Status & Pending Payments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => {
                const pendingPaymentsCount = contract.milestones.filter(
                  (m) => m.status === "PAYMENT_REQUESTED"
                ).length;

                return (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.title}</TableCell>
                    <TableCell>₹{contract.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{contract.bid?.freelancer?.name || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            contract.stage === ContractStage.PROPOSAL && "bg-yellow-500/10 text-yellow-700 border-yellow-300",
                            contract.stage === ContractStage.APPROVAL && "bg-blue-500/10 text-blue-700 border-blue-300",
                            contract.stage === ContractStage.PAYMENT && "bg-green-500/10 text-green-700 border-green-300",
                            contract.stage === ContractStage.REVIEW && "bg-purple-500/10 text-purple-700 border-purple-300",
                            contract.stage === ContractStage.COMPLETED && "bg-green-500/10 text-green-700 border-green-300",
                            contract.stage === ContractStage.CANCELLED && "bg-red-500/10 text-red-700 border-red-300"
                          )}
                        >
                          {contract.stage}
                        </Badge>
                        {pendingPaymentsCount > 0 && (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-black"></span>
                            {pendingPaymentsCount} Pending
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {contract.stage === 'COMPLETED' && (
                          <RatingDialog
                            contractId={contract.id}
                            freelancerId={contract.freelancerId}
                            clientId={contract.clientId}
                            onSuccess={() => router.refresh()}
                          />
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <span className="sr-only">View Details</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold">{contract.title}</DialogTitle>
                              <DialogDescription className="text-muted-foreground">
                                Contract Details
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6">
                              <div className="grid grid-cols-2 gap-4">
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Financial Details</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                                      <span className="text-2xl font-semibold">₹{contract.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="mt-2 text-sm text-muted-foreground">
                                      Delivery Time: {contract.bid?.deliveryTime} days
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Timeline</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                          {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'Start date not set'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                          {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'End date not set'}
                                        </span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                              
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium">Freelancer Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{contract.bid?.freelancer?.name || 'N/A'}</span>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium">Project Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-muted-foreground">{contract.description}</p>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium">Cover Letter</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-muted-foreground">{contract.bid?.coverLetter || 'N/A'}</p>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium">Milestones</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    {contract.milestones.length > 0 ? (
                                      contract.milestones.map((milestone) => (
                                        <Card key={milestone.id} className="bg-muted/50">
                                          <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">{milestone.title}</CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="flex items-center justify-between">
                                              <div>
                                                <p className="text-sm">Amount: ₹{milestone.amount.toLocaleString()}</p>
                                                <p className="text-sm text-muted-foreground">Status: {milestone.status}</p>
                                              </div>
                                              {milestone.status === "PAYMENT_REQUESTED" && (
                                                <Button 
                                                  size="sm"
                                                  onClick={() => window.location.href = `/payment?milestoneId=${milestone.id}&amount=${milestone.amount}`}
                                                >
                                                  Make Payment
                                                </Button>
                                              )}
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))
                                    ) : (
                                      <p className="text-muted-foreground">No milestones for this contract.</p>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
