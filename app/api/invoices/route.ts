import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { InvoiceStatus } from "@prisma/client";

// Schema for invoice creation
const createInvoiceSchema = z.object({
  contractId: z.string(),
  amount: z.number(),
  dueDate: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createInvoiceSchema.parse(body);

    // Get contract details
    const contract = await prisma.contract.findUnique({
      where: { id: validatedData.contractId },
      include: {
        client: true,
        freelancer: true,
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Create the invoice
    const invoice = await prisma.invoice.create({
      data: {
        amount: validatedData.amount,
        dueDate: new Date(validatedData.dueDate),
        status: "PENDING",
        contractId: contract.id,
        clientId: contract.clientId,
        freelancerId: contract.freelancerId,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error creating invoice:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status") as InvoiceStatus | null;

    const where = {
      OR: [
        { clientId: userId || undefined },
        { freelancerId: userId || undefined },
      ],
      ...(status && { status }),
    };

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        contract: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 