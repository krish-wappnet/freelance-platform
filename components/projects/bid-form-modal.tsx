'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BidForm from './bid-form';

interface BidFormModalProps {
  projectId: string;
  projectTitle: string;
  projectBudget: number;
  projectDeadline: Date | null;
}

export default function BidFormModal({ 
  projectId, 
  projectTitle, 
  projectBudget, 
  projectDeadline 
}: BidFormModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="w-full"
      >
        Submit Bid
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Bid for &quot;{projectTitle}&quot;</DialogTitle>
          </DialogHeader>
          <BidForm
            projectId={projectId}
            projectTitle={projectTitle}
            projectBudget={projectBudget}
            projectDeadline={projectDeadline}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
