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

interface ProposalListProps {
  bids: any[];
}

export default function ProposalList({ bids }: ProposalListProps) {
  if (bids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <FileText className="h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No proposals yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Start submitting proposals to projects you're interested in
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bids.map((bid) => (
          <TableRow key={bid.id}>
            <TableCell>
              <div className="font-medium">{bid.project.title}</div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={bid.project.client.avatar || undefined} />
                  <AvatarFallback>{bid.project.client.name[0]}</AvatarFallback>
                </Avatar>
                <span>{bid.project.client.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge 
                variant="outline" 
                className={cn(
                  "capitalize",
                  bid.status === "PENDING" && "bg-yellow-500/10 text-yellow-700 border-yellow-300",
                  bid.status === "SHORTLISTED" && "bg-blue-500/10 text-blue-700 border-blue-300",
                  bid.status === "ACCEPTED" && "bg-green-500/10 text-green-700 border-green-300",
                  bid.status === "REJECTED" && "bg-red-500/10 text-red-700 border-red-300",
                )}
              >
                {bid.status.toLowerCase().replace('_', ' ')}
              </Badge>
            </TableCell>
            <TableCell>
              ₹{bid.proposedBudget}
            </TableCell>
            <TableCell>
              <div className="text-muted-foreground">{formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}</div>
            </TableCell>
            <TableCell className="text-right">
              <Link 
                href={`/freelancer/bids/₹{bid.id}`}
                className="text-primary hover:underline"
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