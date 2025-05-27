import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update all unread notifications for the current user
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return new NextResponse('All notifications marked as read', { status: 200 });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 