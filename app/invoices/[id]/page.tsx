import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { InvoiceView } from "../../components/invoice/InvoiceView";

interface InvoicePageProps {
  params: {
    id: string;
  };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
  dueDate: string;
  issueDate: string;
  paidDate?: string | null;
  notes?: string | null;
  terms?: string | null;
  clientId: string;
  freelancerId: string;
  contract: {
    id: string;
    title: string;
  };
  client: {
    id: string;
    name: string;
    email: string;
  };
  freelancer: {
    id: string;
    name: string;
    email: string;
  };
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  // Use type assertion to work around the Prisma client issue
  const invoice = await (prisma as any).invoice.findUnique({
    where: { id: params.id },
    include: {
      contract: {
        select: {
          id: true,
          title: true,
        },
      },
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
  }) as Invoice | null;

  if (!invoice) {
    notFound();
  }

  // Check if the user has access to this invoice
  if (
    invoice.clientId !== session.user.id &&
    invoice.freelancerId !== session.user.id
  ) {
    redirect("/invoices");
  }

  return (
    <div className="container mx-auto py-8">
      <InvoiceView invoice={invoice} />
    </div>
  );
} 