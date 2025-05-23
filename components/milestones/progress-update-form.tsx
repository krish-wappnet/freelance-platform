'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MilestoneStatus } from '@prisma/client';

interface ProgressUpdateFormProps {
  milestoneId: string;
  currentStatus: MilestoneStatus;
  onUpdate: () => void;
}

export function ProgressUpdateForm({ 
  milestoneId, 
  currentStatus,
  onUpdate 
}: ProgressUpdateFormProps) {
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<MilestoneStatus>(currentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const statusOptions = [
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'PAYMENT_REQUESTED', label: 'Request Payment' },
  ].filter(option => {
    // Filter out current status and payment requested if already requested
    if (currentStatus === 'PAYMENT_REQUESTED') {
      return option.value !== 'PAYMENT_REQUESTED';
    }
    return option.value !== currentStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a progress update',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/milestones/${milestoneId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progressUpdate: description,
          status: status !== currentStatus ? status : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update progress');
      }

      const data = await response.json();
      
      toast({
        title: 'Success',
        description: 'Progress updated successfully',
      });

      // Reset form
      setDescription('');
      
      // Call the parent's onUpdate callback
      onUpdate();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update progress',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Update Progress</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4">
          <Textarea
            placeholder="Describe your progress or updates..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
            disabled={isSubmitting}
          />
          
          <div className="flex items-center gap-4">
            <Select 
              value={status} 
              onValueChange={(value: MilestoneStatus) => setStatus(value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button type="submit" disabled={isSubmitting || !description.trim()}>
              {isSubmitting ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
