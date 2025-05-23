'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressTimeline } from '@/components/milestones/progress-timeline';
import { format } from 'date-fns';
import { MilestoneStatus, Milestone as MilestoneType } from '@prisma/client';
import { useToast } from '@/hooks/use-toast';
import { PaymentButton } from '../../../components/PaymentButton';

interface MilestoneWithUpdates extends MilestoneType {
  contract: {
    id: string;
    freelancerId: string;
    clientId: string;
    project: {
      id: string;
      title: string;
    };
  };
  progressUpdates: Array<{
    id: string;
    description: string;
    status: MilestoneStatus;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    milestoneId: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
  }>;
  payments: Array<{
    id: string;
    status: string;
    amount: number;
  }>;
}

export default function ClientMilestoneDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [milestone, setMilestone] = useState<MilestoneWithUpdates | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMilestone = async () => {
      try {
        const response = await fetch(`/api/milestones/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch milestone');
        }
        const data = await response.json();
        setMilestone(data.milestone);
      } catch (error) {
        console.error('Error fetching milestone:', error);
        toast({
          title: 'Error',
          description: 'Failed to load milestone',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMilestone();
  }, [params.id, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Milestone not found</h2>
        <p className="text-muted-foreground mt-2">The requested milestone could not be found.</p>
      </div>
    );
  }

  const statusBadge = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    PAYMENT_REQUESTED: 'bg-purple-100 text-purple-800',
    PAID: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }[milestone.status] || 'bg-gray-100 text-gray-800';

  const pendingPayment = milestone.payments?.find(p => p.status === 'PENDING');
  const canMakePayment = milestone.status === 'PAYMENT_REQUESTED' && !!pendingPayment;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{milestone.title}</h1>
                <p className="text-muted-foreground">
                  Project: {milestone.contract?.project?.title || 'Unknown Project'}
                </p>
              </div>
              <Badge className={statusBadge}>
                {milestone.status?.toString().replace(/_/g, ' ') || 'UNKNOWN'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-muted-foreground">{milestone.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Amount</h4>
                  <p>${milestone.amount ? milestone.amount.toFixed(2) : '0.00'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Due Date</h4>
                  <p>{milestone.dueDate ? format(new Date(milestone.dueDate), 'MMM d, yyyy') : 'No due date'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                  <p>{milestone.createdAt ? format(new Date(milestone.createdAt), 'MMM d, yyyy') : 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressTimeline updates={milestone.progressUpdates} />
          </CardContent>
        </Card>

        {canMakePayment && pendingPayment && (
          <div className="mt-6">
            <PaymentButton
              paymentId={pendingPayment.id}
              amount={pendingPayment.amount}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
} 