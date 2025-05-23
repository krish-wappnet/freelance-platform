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
          bidId: bidId,  // Changed from proposalId to bidId
          terms: data.terms,
          totalAmount: data.totalAmount,
          milestones: data.milestones,
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
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Contract</CardTitle>
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
                    className="pl-8 min-h-[120px] w-full"
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

            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Milestones</h3>
              {milestones.map((_, index) => (
                <Card key={index} className="mb-4">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-lg font-semibold">
                      Milestone {index + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`milestone-${index}-title`} className="text-sm font-medium">
                          <span className="text-destructive">*</span> Title
                        </Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={`milestone-${index}-title`}
                            {...register(`milestones.${index}.title`)}
                            placeholder="Enter milestone title"
                            className="pl-8"
                          />
                        </div>
                        {errors.milestones?.[index]?.title && (
                          <p className="text-sm text-destructive">
                            {errors.milestones[index].title.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`milestone-${index}-description`} className="text-sm font-medium">
                          <span className="text-destructive">*</span> Description
                        </Label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Textarea
                            id={`milestone-${index}-description`}
                            {...register(`milestones.${index}.description`)}
                            placeholder="Enter milestone description"
                            className="pl-8 min-h-[80px]"
                          />
                        </div>
                        {errors.milestones?.[index]?.description && (
                          <p className="text-sm text-destructive">
                            {errors.milestones[index].description.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <Label htmlFor={`milestone-${index}-amount`} className="text-sm font-medium block mb-2">
                            <span className="text-destructive">*</span> Amount
                          </Label>
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={`milestone-${index}-amount`}
                            type="number"
                            step="0.01"
                            min="0"
                            {...register(`milestones.${index}.amount`)}
                            placeholder="₹0.00"
                            className="pl-8 w-full"
                          />
                        </div>
                        {errors.milestones?.[index]?.amount && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.milestones[index].amount.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`milestone-${index}-dueDate`} className="text-sm font-medium">
                          Due Date
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={`milestone-${index}-dueDate`}
                            type="date"
                            {...register(`milestones.${index}.dueDate`)}
                            className="pl-8"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMilestone(index)}
                      >
                        Remove Milestone
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMilestone}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Milestone
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
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
