"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/lib/client-auth';

interface RatingDialogProps {
  contractId: string;
  freelancerId: string;
  clientId: string;
  onSuccess?: () => void;
}

export function RatingDialog({ contractId, freelancerId, clientId, onSuccess }: RatingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to rate freelancers.",
        variant: "destructive",
      });
      router.push('/auth/signin');
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (review.length < 10) {
      toast({
        title: "Review too short",
        description: "Please write a review of at least 10 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This will send the HTTP-only cookie automatically
        body: JSON.stringify({
          contractId,
          freelancerId,
          clientId,
          rating,
          review,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to submit rating');
      }

      toast({
        title: "Success",
        description: "Your rating has been submitted successfully.",
      });
      setIsOpen(false);
      if (onSuccess) {
        onSuccess();
      }
      router.refresh();
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleStarHover = (value: number) => {
    setHoverRating(value);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const getRatingText = (value: number) => {
    if (value === 0) return 'Select a rating';
    if (value <= 1) return 'Poor';
    if (value <= 2) return 'Fair';
    if (value <= 3) return 'Good';
    if (value <= 4) return 'Very Good';
    return 'Excellent';
  };

  const renderStars = () => {
    const stars = [];
    const currentRating = hoverRating || rating;
    
    for (let i = 1; i <= 5; i++) {
      const isHalfStar = currentRating === i - 0.5;
      const isFullStar = currentRating >= i;
      
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={handleStarLeave}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          {isHalfStar ? (
            <StarHalf
              className={cn(
                "h-8 w-8 transition-colors",
                'fill-yellow-400 text-yellow-400'
              )}
            />
          ) : (
            <Star
              className={cn(
                "h-8 w-8 transition-colors",
                isFullStar
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground/30'
              )}
            />
          )}
        </button>
      );
    }
    return stars;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8 rounded-full border-2 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200 transition-colors"
              >
                <Star className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Rate Freelancer</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Rate Your Experience</DialogTitle>
          <DialogDescription>
            Share your feedback about working with this freelancer
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-1">
              {renderStars()}
            </div>
            <p className="text-center text-sm font-medium">
              {getRatingText(hoverRating || rating)}
            </p>
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Write your review here..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {review.length < 10 ? (
                <span className="text-destructive">
                  {10 - review.length} more characters required
                </span>
              ) : (
                <span className="text-green-600">Minimum length reached</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={rating === 0 || isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 