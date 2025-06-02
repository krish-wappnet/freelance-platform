import { Invoice } from "@prisma/client";

interface InvoiceListProps {
  invoices: (Invoice & {
    contract: any;
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
  })[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <div key={invoice.id} className="border p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Invoice #{invoice.id}</h3>
              <p className="text-sm text-gray-600">
                {invoice.client.name} → {invoice.freelancer.name}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">${invoice.amount}</p>
              <p className="text-sm text-gray-600">{invoice.status}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 