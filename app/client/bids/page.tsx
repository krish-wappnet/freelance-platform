'use client'

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { formatDistanceToNow } from 'date-fns';
import { Briefcase, Users, Clock, Calendar, DollarSign, ExternalLink, Check, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Bid {
  id: string;
  amount: number;
  deliveryTime: number;
  coverLetter: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  freelancerId: string;
  freelancer: {
    name: string;
    avatar: string | null;
    rating: number | null;
    totalReviews: number;
  };
  project: {
    title: string;
    budget: number;
    createdAt: Date;
  };
}

interface Filter {
  status: 'all' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
  projectId: string;
  sortBy: 'createdAt' | 'amount' | 'deliveryTime';
  sortOrder: 'asc' | 'desc';
}

export default function ClientBids() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>({
    status: 'all',
    projectId: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const fetchBids = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status !== 'all') params.append('status', filter.status);
      if (filter.projectId) params.append('projectId', filter.projectId);
      params.append('sortBy', filter.sortBy);
      params.append('sortOrder', filter.sortOrder);

      const response = await fetch(`/api/client/bids?${params.toString()}`);
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

  const updateBidStatus = async (bidId: string, status: string) => {
    try {
      const response = await fetch('/api/client/bids', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: bidId, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bid status');
      }

      // Refresh the bids list
      fetchBids();
    } catch (error) {
      console.error('Error updating bid status:', error);
    }
  };

  useEffect(() => {
    fetchBids();
  }, [filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">Loading...</div>
    );
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <CardTitle>Received Bids</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <Label>Status</Label>
                  <Select
                    value={filter.status}
                    onValueChange={(value) =>
                      setFilter((prev) => ({ ...prev, status: value as Filter['status'] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="ACCEPTED">Accepted</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <Label>Sort by</Label>
                  <Select
                    value={filter.sortBy}
                    onValueChange={(value) =>
                      setFilter((prev) => ({ ...prev, sortBy: value as Filter['sortBy'] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created At</SelectItem>
                      <SelectItem value="amount">Bid Amount</SelectItem>
                      <SelectItem value="deliveryTime">Delivery Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <Label>Order</Label>
                  <Select
                    value={filter.sortOrder}
                    onValueChange={(value) =>
                      setFilter((prev) => ({ ...prev, sortOrder: value as Filter['sortOrder'] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {bids.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No bids received</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start by posting a project to receive bids
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {bids.map((bid) => (
                <Card key={bid.id} className="p-4">
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <h3 className="font-medium">{bid.project.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          ₹{bid.project.budget} budget
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          bid.status === "PENDING" && "bg-yellow-500/10 text-yellow-700 border-yellow-300",
                          bid.status === "ACCEPTED" && "bg-green-500/10 text-green-700 border-green-300",
                          bid.status === "REJECTED" && "bg-red-500/10 text-red-700 border-red-300",
                        )}
                      >
                        {bid.status.toLowerCase().replace('_', ' ')}
                      </Badge>
                      {bid.status === 'ACCEPTED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-4"
                          onClick={() => {
                            window.location.href = `/client/contracts/${bid.projectId}`;
                          }}
                        >
                          View Contract
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>₹{bid.amount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{bid.deliveryTime} days</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(bid.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{bid.freelancer.name}</span>
                        </div>
                        {bid.freelancer.rating && (
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-500">★</span>
                            <span>{bid.freelancer.rating}</span>
                            <span>({bid.freelancer.totalReviews} reviews)</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <CardHeader className="pt-0">
                        <CardTitle>Cover Letter</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">{bid.coverLetter}</p>
                      </CardContent>
                    </div>
                    <div className="flex justify-end gap-2">
                      {bid.status === 'PENDING' && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => updateBidStatus(bid.id, 'REJECTED')}
                            className="flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            variant="default"
                            onClick={() => {
                              updateBidStatus(bid.id, 'ACCEPTED');
                              window.location.href = `/client/contracts/create?projectId=${bid.projectId}&bidId=${bid.id}`;
                            }}
                            className="flex items-center gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Accept & Create Contract
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
