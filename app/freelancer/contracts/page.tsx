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
import { cn } from '@/lib/utils';
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.title}</TableCell>
                    <TableCell>₹{contract.bid.amount.toLocaleString()}</TableCell>
                    <TableCell>{contract.project.client.name}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">View Details</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">{contract.title}</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                              Contract Details
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h3 className="font-medium mb-2">Financial Details</h3>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                                  <span className="text-2xl font-semibold">₹{contract.bid.amount.toLocaleString()}</span>
                                </div>
                                <div className="mt-2 text-sm text-muted-foreground">
                                  Delivery Time: {contract.bid.deliveryTime} days
                                </div>
                              </div>
                              <div>
                                <h3 className="font-medium mb-2">Timeline</h3>
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
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-medium mb-2">Client Information</h3>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{contract.project.client.name}</span>
                              </div>
                            </div>

                            <div>
                              <h3 className="font-medium mb-2">Project Description</h3>
                              <p className="text-muted-foreground">{contract.description}</p>
                            </div>

                            <div>
                              <h3 className="font-medium mb-2">Cover Letter</h3>
                              <p className="text-muted-foreground">{contract.bid.coverLetter}</p>
                            </div>

                            <div>
                              <h3 className="font-medium mb-2">Milestones</h3>
                              <div className="space-y-3">
                                {contract.milestones.map((milestone) => (
                                  <div key={milestone.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{milestone.title}</span>
                                      <span className="text-sm text-muted-foreground">₹{milestone.amount.toLocaleString()}</span>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "capitalize",
                                        milestone.status === "PENDING" && "bg-yellow-500/10 text-yellow-700 border-yellow-300",
                                        milestone.status === "COMPLETED" && "bg-green-500/10 text-green-700 border-green-300"
                                      )}
                                    >
                                      {milestone.status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
