import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { InvoiceList } from "@/components/invoice/InvoiceList";

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      OR: [
        { clientId: session.user.id },
        { freelancerId: session.user.id },
      ],
    },
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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Invoices</h1>
      <InvoiceList invoices={invoices} />
    </div>
  );
} 