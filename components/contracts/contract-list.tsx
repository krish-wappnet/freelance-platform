"use client";

import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileText,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContractListProps {
  contracts: any[];
}

export default function ContractList({ contracts }: ContractListProps) {
  if (contracts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <FileText className="h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No contracts yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Contracts will appear here once you hire freelancers
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Freelancer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contracts.map((contract) => (
          <TableRow key={contract.id}>
            <TableCell>
              <div className="font-medium">{contract.project.title}</div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={contract.proposal.freelancer.avatar || undefined} />
                  <AvatarFallback>{contract.proposal.freelancer.name[0]}</AvatarFallback>
                </Avatar>
                <span>{contract.proposal.freelancer.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge 
                variant="outline" 
                className={cn(
                  "capitalize",
                  contract.status === "PROPOSED" && "bg-yellow-500/10 text-yellow-700 border-yellow-300",
                  contract.status === "APPROVED" && "bg-green-500/10 text-green-700 border-green-300",
                  contract.status === "IN_PROGRESS" && "bg-blue-500/10 text-blue-700 border-blue-300",
                  contract.status === "COMPLETED" && "bg-gray-500/10 text-gray-700 border-gray-300",
                  contract.status === "CANCELLED" && "bg-red-500/10 text-red-700 border-red-300",
                  contract.status === "DISPUTED" && "bg-orange-500/10 text-orange-700 border-orange-300",
                )}
              >
                {contract.status.toLowerCase().replace('_', ' ')}
              </Badge>
            </TableCell>
            <TableCell>
              ₹{contract.totalAmount}
            </TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(contract.updatedAt), { addSuffix: true })}
            </TableCell>
            <TableCell className="text-right">
              <Link 
                href={`/client/contracts/₹{contract.id}`}
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                View <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}