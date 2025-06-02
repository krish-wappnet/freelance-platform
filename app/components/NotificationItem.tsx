'use client';

import { useState } from 'react';
import { Notification as PrismaNotification, NotificationType } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { PaymentButton } from './PaymentButton';
import { Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: PrismaNotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({ notification, onRead, onDelete }: NotificationItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/notifications/${notification.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      onDelete(notification.id);
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
      console.error('Error deleting notification:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isPaymentNotification = notification.type === NotificationType.PAYMENT_RECEIVED || 
                              notification.type === NotificationType.PAYMENT_FAILED;

  return (
    <div className={cn(
      "p-4 hover:bg-accent/50 transition-colors",
      !notification.isRead && "bg-accent/30"
    )}>
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm">{notification.title}</h3>
            <div className="flex items-center gap-2 shrink-0">
              {!notification.isRead && !isPaymentNotification && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRead(notification.id)}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Mark as read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
          {notification.amount && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm font-medium text-green-600">
                ${notification.amount.toFixed(2)}
              </span>
              {isPaymentNotification && notification.referenceId && (
                <PaymentButton
                  paymentId={notification.referenceId}
                  amount={notification.amount}
                  onSuccess={() => onRead(notification.id)}
                  className="h-8 text-xs"
                />
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
} 