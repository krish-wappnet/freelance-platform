'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface BidFormProps {
  projectId: string;
  projectTitle: string;
  projectBudget: number;
  projectDeadline: Date | null;
}

export default function BidForm({ projectId, projectTitle, projectBudget, projectDeadline }: BidFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const amount = formData.get('amount') as string;
    const deliveryTime = formData.get('deliveryTime') as string;
    const coverLetter = formData.get('proposal') as string;

    try {
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          amount: parseFloat(amount),
          deliveryTime: parseInt(deliveryTime),
          coverLetter,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit bid');
      }

      toast.success('Bid submitted successfully');
      e.currentTarget.reset();
      router.push('/freelancer/bids');
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit bid');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Bid for "{projectTitle}"</CardTitle>
        <CardDescription>
          Review the project details and submit your bid
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Budget</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">₹</span>
              <span className="font-medium text-lg">{projectBudget.toLocaleString()}</span>
            </div>
          </div>

          {projectDeadline && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Deadline</label>
              <div className="text-sm text-gray-500">
                {format(new Date(projectDeadline), 'MMM d, yyyy')}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Bid Amount</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">₹</span>
              <Input
                id="amount"
                name="amount"
                type="number"
                min={0}
                required
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Estimated Delivery Time (days)</label>
            <Input
              id="deliveryTime"
              name="deliveryTime"
              type="number"
              min={1}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Proposal</label>
            <Textarea
              id="proposal"
              name="proposal"
              placeholder="Write your cover letter for the project..."
              required
              className="w-full min-h-[150px]"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Bid'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
