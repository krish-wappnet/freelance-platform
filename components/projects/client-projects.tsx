'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { formatDistanceToNow } from 'date-fns';
import { Clock, DollarSign, Users } from 'lucide-react';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    budget: number;
    deadline: Date;
    status: string;
    createdAt: Date;
    bids: {
      id: string;
      freelancer: {
        name: string;
        avatar: string;
      };
    }[];
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const handleViewBids = () => {
    // TODO: Implement view bids functionality
    toast('Coming Soon', {
      description: 'View bids functionality will be available soon',
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{project.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(project.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">₹{project.budget.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Deadline: {format(new Date(project.deadline), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {project.bids.length} {project.bids.length === 1 ? 'bid' : 'bids'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewBids}
            className="ml-auto"
          >
            View Bids
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
