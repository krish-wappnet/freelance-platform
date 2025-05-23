import { getCurrentUser, hasRole } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { PaymentStatus, UserRole } from '@prisma/client';
import { z } from 'zod';

const updatePaymentSchema = z.object({
  status: z.enum([
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'REFUNDED',
  ]),
  paymentMethod: z.string().optional(),
  paymentDate: z.string().optional(),
});

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     description: Returns a specific payment by its ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details
 *       401:
 *         description: Not authenticated or unauthorized
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        contract: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                clientId: true,
                client: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            freelancer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        milestone: true,
      },
    });
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to view this payment
    if (
      payment.contract.freelancer.id !== user.id &&
      payment.contract.project.clientId !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { error: 'You are not authorized to view this payment' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ payment }, { status: 200 });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/payments/{id}:
 *   put:
 *     summary: Update payment
 *     description: Updates a specific payment
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED]
 *               paymentMethod:
 *                 type: string
 *               paymentDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Payment updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authenticated or unauthorized
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        contract: {
          include: {
            project: true,
          },
        },
      },
    });
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    // Only client or admin can update payment status
    if (
      payment.contract.project.clientId !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { error: 'Only the client can update payment status' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const result = updatePaymentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }
    
    const { status, paymentMethod, paymentDate } = result.data;
    
    // Check valid status transitions
    if (
      payment.status === PaymentStatus.COMPLETED &&
      status !== PaymentStatus.REFUNDED
    ) {
      return NextResponse.json(
        { error: 'Completed payments can only be refunded' },
        { status: 400 }
      );
    }
    
    if (
      payment.status === PaymentStatus.REFUNDED &&
      status !== PaymentStatus.REFUNDED
    ) {
      return NextResponse.json(
        { error: 'Refunded payments cannot be updated' },
        { status: 400 }
      );
    }
    
    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id: params.id },
      data: {
        status: status as PaymentStatus,
        ...(paymentMethod && { paymentMethod }),
        ...(paymentDate && { paymentDate: new Date(paymentDate) }),
        ...(status === PaymentStatus.COMPLETED && !paymentDate && { paymentDate: new Date() }),
      },
    });
    
    return NextResponse.json(
      { message: 'Payment updated successfully', payment: updatedPayment },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}