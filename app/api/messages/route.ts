import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const messageSchema = z.object({
  receiverId: z.string().uuid(),
  content: z.string().min(1),
});

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get messages
 *     description: Returns conversations for the current user
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Get messages with a specific user
 *     responses:
 *       200:
 *         description: List of messages
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (userId) {
      // Get conversation with specific user
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            {
              senderId: user.id,
              receiverId: userId,
            },
            {
              senderId: userId,
              receiverId: user.id,
            },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      
      // Mark unread messages as read
      await prisma.message.updateMany({
        where: {
          senderId: userId,
          receiverId: user.id,
          read: false,
        },
        data: {
          read: true,
        },
      });
      
      return NextResponse.json({ messages }, { status: 200 });
    } else {
      // Get all conversations
      // First, get all users this user has exchanged messages with
      const conversations = await prisma.$queryRaw`
        SELECT 
          DISTINCT
          CASE 
            WHEN m."senderId" = ${user.id} THEN m."receiverId" 
            ELSE m."senderId" 
          END AS "userId",
          u.name, 
          u.avatar,
          MAX(m."createdAt") as "lastMessageAt",
          (
            SELECT COUNT(*) 
            FROM "Message" 
            WHERE "receiverId" = ${user.id} 
            AND "senderId" = CASE 
              WHEN m."senderId" = ${user.id} THEN m."receiverId" 
              ELSE m."senderId" 
            END
            AND "read" = false
          ) as "unreadCount"
        FROM "Message" m
        JOIN "User" u ON u.id = CASE 
          WHEN m."senderId" = ${user.id} THEN m."receiverId" 
          ELSE m."senderId" 
        END
        WHERE m."senderId" = ${user.id} OR m."receiverId" = ${user.id}
        GROUP BY CASE 
          WHEN m."senderId" = ${user.id} THEN m."receiverId" 
          ELSE m."senderId" 
        END, u.name, u.avatar
        ORDER BY "lastMessageAt" DESC
      `;
      
      return NextResponse.json({ conversations }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message
 *     description: Sends a message to another user
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *                 format: uuid
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Receiver not found
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const result = messageSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }
    
    const { receiverId, content } = result.data;
    
    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });
    
    if (!receiver) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 404 }
      );
    }
    
    // Can't send message to self
    if (receiverId === user.id) {
      return NextResponse.json(
        { error: 'Cannot send a message to yourself' },
        { status: 400 }
      );
    }
    
    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    
    return NextResponse.json(
      { message: 'Message sent', data: message },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}