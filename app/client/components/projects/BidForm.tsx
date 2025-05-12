'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/client-auth';
import { useRouter } from 'next/navigation';

interface BidFormProps {
  projectId: string;
  projectBudget: number;
  onBack: () => void;
}

export default function BidForm({ projectId, projectBudget, onBack }: BidFormProps) {
  const [amount, setAmount] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push('/login');
      return;
    }

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
        throw new Error('Failed to submit bid');
      }

      toast({
        title: 'Success',
        description: 'Your bid has been submitted successfully',
      });

      router.push('/freelancer/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit bid. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Bid</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Bid Amount (₹)
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter your bid amount (Project budget: ₹${projectBudget})`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Delivery Time (days)
            </label>
            <Input
              type="number"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              placeholder="Enter delivery time in days"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Cover Letter
            </label>
            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Write a cover letter explaining why you're the best fit for this project"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit">Submit Bid</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
