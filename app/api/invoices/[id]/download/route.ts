import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PDFDocument from "pdfkit";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        contract: true,
        client: true,
        freelancer: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Create a new PDF document
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    // Collect PDF chunks
    doc.on("data", (chunk) => chunks.push(chunk));

    // Add content to the PDF
    doc.fontSize(25).text("INVOICE", { align: "center" });
    doc.moveDown();
    
    // Invoice details
    doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
    doc.moveDown();

    // From/To sections
    doc.text("From:", { continued: true })
      .text(` ${invoice.freelancer.name}`, { align: "right" });
    doc.text(`Email: ${invoice.freelancer.email}`);
    doc.moveDown();

    doc.text("To:", { continued: true })
      .text(` ${invoice.client.name}`, { align: "right" });
    doc.text(`Email: ${invoice.client.email}`);
    doc.moveDown();

    // Amount
    doc.text("Amount:", { continued: true })
      .text(` $${invoice.amount.toFixed(2)}`, { align: "right" });
    doc.moveDown();

    // Notes and Terms
    if (invoice.notes) {
      doc.text("Notes:");
      doc.text(invoice.notes);
      doc.moveDown();
    }

    if (invoice.terms) {
      doc.text("Terms & Conditions:");
      doc.text(invoice.terms);
    }

    // Finalize the PDF
    doc.end();

    // Wait for the PDF to be generated
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
    });

    // Return the PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 