'use client';

import { useState } from 'react';
import { NotificationItem } from './NotificationItem';
import { Notification } from '@prisma/client';

interface NotificationsListProps {
  notifications: Notification[];
  onNotificationRead: (id: string) => void;
}

export function NotificationsList({ notifications, onNotificationRead }: NotificationsListProps) {
  const [localNotifications, setLocalNotifications] = useState(notifications);

  const handleDelete = (id: string) => {
    setLocalNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (localNotifications.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No notifications
      </div>
    );
  }

  return (
    <div className="divide-y">
      {localNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRead={onNotificationRead}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
} 