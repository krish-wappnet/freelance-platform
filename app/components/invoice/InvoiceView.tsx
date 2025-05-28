import { useState } from "react";
import { format } from "date-fns";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InvoiceViewProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    amount: number;
    status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
    dueDate: string;
    issueDate: string;
    paidDate?: string | null;
    notes?: string | null;
    terms?: string | null;
    contract: {
      title: string;
    };
    client: {
      name: string;
      email: string;
    };
    freelancer: {
      name: string;
      email: string;
    };
  };
}

export function InvoiceView({ invoice }: InvoiceViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-500";
      case "OVERDUE":
        return "bg-red-500";
      case "SENT":
        return "bg-blue-500";
      case "DRAFT":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading invoice:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Invoice #{invoice.invoiceNumber}</CardTitle>
            <CardDescription>
              {invoice.contract.title}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(invoice.status)}>
            {invoice.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-2">From</h3>
            <p>{invoice.freelancer.name}</p>
            <p>{invoice.freelancer.email}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">To</h3>
            <p>{invoice.client.name}</p>
            <p>{invoice.client.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-2">Issue Date</h3>
            <p>{format(new Date(invoice.issueDate), "PPP")}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Due Date</h3>
            <p>{format(new Date(invoice.dueDate), "PPP")}</p>
          </div>
        </div>

        <div className="border-t border-b py-4 mb-8">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Amount</span>
            <span className="text-2xl font-bold">
              ${invoice.amount.toFixed(2)}
            </span>
          </div>
        </div>

        {invoice.notes && (
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-gray-600">{invoice.notes}</p>
          </div>
        )}

        {invoice.terms && (
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Terms & Conditions</h3>
            <p className="text-gray-600">{invoice.terms}</p>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 