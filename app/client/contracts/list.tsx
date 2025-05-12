'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/client-auth';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

interface Contract {
  id: string;
  title: string;
  description: string;
  amount: number;
  stage: string;
  startDate?: string;
  endDate?: string;
}

interface ContractsListProps {
  contracts: Contract[];
}

export default function ContractsList() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch('/api/contracts');
        if (!response.ok) {
          throw new Error('Failed to fetch contracts');
        }
        const data: Contract[] = await response.json();
        setContracts(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load contracts',
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
    <div className="container mx-auto py-8">
      <div className="grid gap-4">
        {contracts.map((contract) => (
          <Card key={contract.id}>
            <CardHeader>
              <CardTitle>{contract.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground line-clamp-2">
                  {contract.description}
                </p>
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
                      {contract.startDate
                        ? format(new Date(contract.startDate), 'MMM d, yyyy')
                        : 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">End Date:</span>
                    <span className="ml-2">
                      {contract.endDate
                        ? format(new Date(contract.endDate), 'MMM d, yyyy')
                        : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <Button
                onClick={() => router.push(`/client/contracts/${contract.id}`)}
                className="w-full"
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
