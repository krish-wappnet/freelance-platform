'use client'

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/client-auth';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, Clock, Calendar, FileText, Briefcase, Plus, Check, Loader2 } from 'lucide-react';

const contractSchema = z.object({
  terms: z.string().min(10, 'Terms must be at least 10 characters'),
  totalAmount: z.string().transform(Number).refine(
    (value) => value > 0,
    'Amount must be positive'
  ),
  milestones: z.array(
    z.object({
      title: z.string().min(2, 'Title is required'),
      description: z.string().min(10, 'Description is required'),
      amount: z.string().transform(Number).refine(
        (value) => value > 0,
        'Amount must be positive'
      ),
      dueDate: z.string().optional(),
    })
  ).min(1, 'At least one milestone is required'),
}).refine(
  (data) => {
    const totalMilestoneAmount = data.milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
    return Math.abs(totalMilestoneAmount - data.totalAmount) < 0.01; // Allow for small floating point differences
  },
  {
    message: 'The sum of milestone amounts must equal the total contract amount',
    path: ['milestones'],
  }
);

type ContractFormValues = {
  terms: string;
  totalAmount: number;
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
    dueDate?: string;
  }>;
};

export default function CreateContractPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [projectId, setProjectId] = useState('');
  const [bidId, setBidId] = useState('');
  const [bidAmount, setBidAmount] = useState(0);
  const [deliveryTime, setDeliveryTime] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setProjectId(urlParams.get('projectId') || '');
    setBidId(urlParams.get('bidId') || '');
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      terms: '',
      totalAmount: bidAmount,
      milestones: [{
        title: '',
        description: '',
        amount: 0,
      }],
    },
  });

  // Fetch bid details when bidId changes
  useEffect(() => {
    const fetchBidDetails = async () => {
      if (!bidId) return;

      try {
        const response = await fetch(`/api/bids/${bidId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bid details');
        }

        const bid = await response.json();
        setBidAmount(bid.amount);
        setDeliveryTime(bid.deliveryTime);
        setValue('totalAmount', bid.amount);
      } catch (error) {
        console.error('Error fetching bid details:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch bid details',
          variant: 'destructive',
        });
      }
    };

    fetchBidDetails();
  }, [bidId, setValue, toast]);

  const onSubmit = async (data: ContractFormValues) => {
    try {
      setLoading(true);
      
      // Validate that total amount matches milestone amounts
      const totalMilestoneAmount = data.milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
      if (Math.abs(totalMilestoneAmount - data.totalAmount) > 0.01) {
        throw new Error('The sum of milestone amounts must equal the total contract amount');
      }

      console.log('Form submission data:', {
        proposalId: bidId,
        terms: data.terms,
        totalAmount: data.totalAmount,
        milestones: data.milestones,
      });
      
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bidId: bidId,
          terms: data.terms,
          amount: data.totalAmount,
          milestones: data.milestones.map(milestone => ({
            title: milestone.title,
            description: milestone.description,
            amount: milestone.amount,
            dueDate: milestone.dueDate
          }))
        }),
      });
      
      console.log('API response status:', response.status);
      const responseData = await response.json();
      console.log('API response data:', responseData);

      if (response.status === 409) {
        throw new Error(responseData.error || 'Failed to create contract');
      } else if (response.status === 200) {
        toast({
          title: 'Success',
          description: 'Contract updated successfully',
        });
        router.push('/client/contracts/list');
        return;
      } else if (response.status === 201) {
        toast({
          title: 'Success',
          description: 'Contract created successfully',
        });
        router.push('/client/contracts/list');
        return;
      }

      // Handle other error cases
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create contract');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create contract',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const milestones = watch('milestones');

  const addMilestone = () => {
    const newMilestones = [...milestones, {
      title: '',
      description: '',
      amount: 0,
    }];
    setValue('milestones', newMilestones);
  };

  const removeMilestone = (index: number) => {
    const newMilestones = [...milestones];
    newMilestones.splice(index, 1);
    setValue('milestones', newMilestones);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create Contract</CardTitle>
          <p className="text-muted-foreground">Fill in the details to create a new contract with milestones.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="relative">
                  <Label htmlFor="terms" className="text-sm font-medium block mb-2">
                    <span className="text-destructive">*</span> Terms and Conditions
                  </Label>
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="terms"
                    {...register('terms')}
                    placeholder="Enter contract terms and conditions..."
                    className="pl-8 min-h-[120px] w-full resize-none"
                  />
                  {errors.terms && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.terms.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Label htmlFor="totalAmount" className="text-sm font-medium block mb-2">
                    <span className="text-destructive">*</span> Total Amount
                  </Label>
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('totalAmount')}
                    placeholder="₹0.00"
                    className="pl-8 w-full"
                  />
                  {errors.totalAmount && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.totalAmount.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Milestones</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMilestone}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Milestone
                </Button>
              </div>

              <div className="space-y-6">
                {milestones.map((_, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium">Milestone {index + 1}</h3>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMilestone(index)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`milestones.${index}.title`}>Title</Label>
                        <Input
                          id={`milestones.${index}.title`}
                          {...register(`milestones.${index}.title`)}
                          placeholder="Enter milestone title"
                        />
                        {errors.milestones?.[index]?.title && (
                          <p className="text-sm text-destructive">
                            {errors.milestones[index]?.title?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`milestones.${index}.amount`}>Amount</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={`milestones.${index}.amount`}
                            type="number"
                            step="0.01"
                            min="0"
                            {...register(`milestones.${index}.amount`)}
                            placeholder="₹0.00"
                            className="pl-8"
                          />
                        </div>
                        {errors.milestones?.[index]?.amount && (
                          <p className="text-sm text-destructive">
                            {errors.milestones[index]?.amount?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <Label htmlFor={`milestones.${index}.description`}>Description</Label>
                      <Textarea
                        id={`milestones.${index}.description`}
                        {...register(`milestones.${index}.description`)}
                        placeholder="Enter milestone description"
                        className="min-h-[80px] resize-none"
                      />
                      {errors.milestones?.[index]?.description && (
                        <p className="text-sm text-destructive">
                          {errors.milestones[index]?.description?.message}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <Label htmlFor={`milestones.${index}.dueDate`}>Due Date (Optional)</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={`milestones.${index}.dueDate`}
                          type="date"
                          {...register(`milestones.${index}.dueDate`)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {errors.milestones && !Array.isArray(errors.milestones) && (
                <p className="text-sm text-destructive">
                  {errors.milestones.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create Contract
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
