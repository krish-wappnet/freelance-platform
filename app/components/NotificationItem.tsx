import { Notification as PrismaNotification, NotificationType } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { PaymentButton } from './PaymentButton';

interface NotificationWithAmount extends PrismaNotification {
  amount?: number;
}

interface NotificationItemProps {
  notification: NotificationWithAmount;
  onRead: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const isPaymentRequest = notification.type === 'PAYMENT_REQUEST';

  return (
    <div className="flex items-start justify-between p-4 border-b">
      <div className="flex-1">
        <h3 className="font-medium">{notification.title}</h3>
        <p className="text-sm text-gray-600">{notification.message}</p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isPaymentRequest && notification.referenceId && (
          <PaymentButton
            paymentId={notification.referenceId}
            amount={notification.amount || 0}
            onSuccess={() => onRead(notification.id)}
            className="whitespace-nowrap"
          />
        )}
        {!notification.isRead && !isPaymentRequest && (
          <button
            onClick={() => onRead(notification.id)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Mark as read
          </button>
        )}
      </div>
    </div>
  );
} 