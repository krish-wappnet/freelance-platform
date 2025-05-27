"use client";

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileText,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContractStage } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Contract {
  id: string;
  title: string;
  description: string;
  amount: number;
  stage: ContractStage;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    title: string;
  };
  bid: {
    freelancer: {
      id: string;
      name: string;
      avatar: string | null;
    };
  };
  milestones: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

interface ContractListProps {
  contracts: Contract[];
}

export default function ContractList({ contracts }: ContractListProps) {
  const [completingContractId, setCompletingContractId] = useState<string | null>(null);

  const handleCompleteContract = async (contractId: string) => {
    try {
      setCompletingContractId(contractId);
      const response = await fetch(`/api/contracts/${contractId}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete contract');
      }

      toast.success('Contract completed successfully');
      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete contract');
    } finally {
      setCompletingContractId(null);
    }
  };

  const canCompleteContract = (contract: Contract) => {
    return (
      contract.stage === ContractStage.REVIEW &&
      contract.milestones.every(milestone => milestone.status === 'COMPLETED')
    );
  };

  if (contracts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <FileText className="h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No contracts yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Contracts will appear here once you hire freelancers
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contracts.map((contract) => (
        <Card key={contract.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{contract.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Project: {contract.project.title}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canCompleteContract(contract) && (
                  <Button
                    onClick={() => handleCompleteContract(contract.id)}
                    disabled={completingContractId === contract.id}
                  >
                    {completingContractId === contract.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      'Complete Contract'
                    )}
                  </Button>
                )}
                <div className="text-sm font-medium">
                  Status: {contract.stage}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {contract.description}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Amount</h4>
                <p className="text-sm text-muted-foreground">
                  ₹{contract.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Milestones</h4>
                <div className="space-y-2">
                  {contract.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{milestone.title}</span>
                      <span className="text-muted-foreground">
                        {milestone.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}