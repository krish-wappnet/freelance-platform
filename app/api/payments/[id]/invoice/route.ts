import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get payment details with related data
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        contract: {
          include: {
            project: true,
            freelancer: true,
            client: true,
          },
        },
        milestone: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify the user is either the client or freelancer
    if (payment.clientId !== user.id && payment.freelancerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create PDF document
    const doc = new jsPDF();
    let y = 20; // Starting y position

    // Add company logo and header
    doc.setFillColor(41, 128, 185); // Primary color
    doc.rect(0, 0, 210, 40, 'F');
    
    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('WorkWave', 20, 25);
    
    // Invoice title
    doc.setFontSize(16);
    doc.text('INVOICE', 160, 25);
    
    // Reset text color for content
    doc.setTextColor(0, 0, 0);
    y = 60;

    // Invoice details in a grid layout
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Left column - Invoice details
    doc.text('Invoice Details:', 20, y);
    y += 10;
    doc.text(`Invoice Number: ${payment.id}`, 20, y);
    y += 7;
    doc.text(`Date: ${format(payment.createdAt, 'PPP')}`, 20, y);
    y += 7;
    doc.text(`Status: ${payment.status}`, 20, y);
    
    // Right column - Amount
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`₹${payment.amount.toFixed(2)}`, 160, y - 14);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Total Amount', 160, y - 4);
    
    y += 20;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 20;

    // Project and Milestone details
    doc.setFont('helvetica', 'bold');
    doc.text('Project Details', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 10;
    doc.text(`Project: ${payment.contract.project.title}`, 30, y);
    y += 7;
    doc.text(`Milestone: ${payment.milestone.title}`, 30, y);
    y += 20;

    // Client and Freelancer details in two columns
    const clientX = 20;
    const freelancerX = 110;
    
    // Client details
    doc.setFont('helvetica', 'bold');
    doc.text('Client Details', clientX, y);
    doc.setFont('helvetica', 'normal');
    y += 10;
    doc.text(`Name: ${payment.contract.client.name}`, clientX, y);
    y += 7;
    doc.text(`Email: ${payment.contract.client.email}`, clientX, y);
    
    // Freelancer details
    doc.setFont('helvetica', 'bold');
    doc.text('Freelancer Details', freelancerX, y - 17);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${payment.contract.freelancer.name}`, freelancerX, y);
    doc.text(`Email: ${payment.contract.freelancer.email}`, freelancerX, y + 7);
    
    y += 30;

    // Payment details
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Information', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 10;
    doc.text(`Transaction ID: ${payment.paymentIntentId}`, 30, y);
    y += 20;

    // Terms and conditions
    doc.setFont('helvetica', 'bold');
    doc.text('Terms and Conditions', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 10;
    doc.text('This invoice is automatically generated and is valid without signature.', 30, y);
    y += 20;

    // Footer
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 270, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Thank you for your business!', 105, 285, { align: 'center' });
    doc.text('© 2024 Freelance Platform. All rights reserved.', 105, 295, { align: 'center' });

    // Get the PDF as a buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${payment.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
} 