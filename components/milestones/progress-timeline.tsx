'use client';

import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MilestoneStatus } from '@prisma/client';

interface ProgressUpdate {
  id: string;
  description: string;
  status: MilestoneStatus;
  createdAt: string | Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface ProgressTimelineProps {
  updates?: ProgressUpdate[] | null;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  PAYMENT_REQUESTED: 'bg-purple-100 text-purple-800',
  PAID: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  PAYMENT_REQUESTED: 'Payment Requested',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
};

export function ProgressTimeline({ updates = [] }: ProgressTimelineProps) {
  if (!updates || updates.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No progress updates yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {updates.map((update) => (
        <Card key={update.id} className="p-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${update.user.email}`} alt={update.user.name || ''} />
                <AvatarFallback>{update.user.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  {update.user.name || 'Unknown User'}
                </h4>
                <span className="text-sm text-muted-foreground">
                  {format(update.createdAt instanceof Date ? update.createdAt : new Date(update.createdAt), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusColors[update.status] || 'bg-gray-100 text-gray-800'
                }`}>
                  {statusLabels[update.status] || update.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-foreground">
                {update.description}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
