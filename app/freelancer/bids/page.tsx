'use client'

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Bid {
  id: string;
  amount: number;
  deliveryTime: number;
  coverLetter: string;
  status: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
    description: string;
    budget: number;
    status: string;
  };
}

export default function FreelancerBids() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const response = await fetch('/api/freelancer/bids');
      if (!response.ok) {
        throw new Error('Failed to fetch bids');
      }
      const data = await response.json();
      setBids(data.bids);
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Bids</CardTitle>
          <CardDescription>View all your submitted bids and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Bid Amount</TableHead>
                <TableHead>Delivery Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell>
                    <div className="font-medium">{bid.project.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {bid.project.description.substring(0, 100)}...
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">₹{bid.amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      Project Budget: ₹{bid.project.budget.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {bid.deliveryTime} days
                  </TableCell>
                  <TableCell>
                    <Badge variant={bid.status === 'PENDING' ? 'secondary' : bid.status === 'SHORTLISTED' ? 'default' : bid.status === 'ACCEPTED' ? 'outline' : 'destructive'}>
                      {bid.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(bid.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
