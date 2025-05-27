import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { isRead } = body;

    const notification = await prisma.notification.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!notification) {
      return new NextResponse('Notification not found', { status: 404 });
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: params.id,
      },
      data: {
        isRead,
      },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error('Error updating notification:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Find the notification and verify ownership
    const notification = await prisma.notification.findUnique({
      where: { id: params.id }
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (notification.userId !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Delete the notification
    await prisma.notification.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 