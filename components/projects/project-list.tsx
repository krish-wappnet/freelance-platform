"use client";

import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
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
  Briefcase,
  Users,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import BidFormModal from './bid-form-modal';
import { cn } from '@/lib/utils';

interface ProjectListProps {
  projects: any[];
  role: 'CLIENT' | 'FREELANCER';
}

export default function ProjectList({ projects, role }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Briefcase className="h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No projects yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Start by creating your first project
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Proposals</TableHead>
          <TableHead>Posted</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell>
              <div className="font-medium">{project.title}</div>
              <div className="text-sm text-muted-foreground">
                Budget: ₹{project.budget}
              </div>
            </TableCell>
            <TableCell>
              <Badge 
                variant="outline" 
                className={cn(
                  "capitalize",
                  project.status === "OPEN" && "bg-green-500/10 text-green-700 border-green-300",
                  project.status === "IN_PROGRESS" && "bg-blue-500/10 text-blue-700 border-blue-300",
                  project.status === "COMPLETED" && "bg-gray-500/10 text-gray-700 border-gray-300",
                  project.status === "CANCELLED" && "bg-red-500/10 text-red-700 border-red-300",
                )}
              >
                {project.status.toLowerCase().replace('_', ' ')}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{project.bids?.length || 0}</span>
              </div>
            </TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
            </TableCell>
            <TableCell className="text-right">
              {role === 'CLIENT' ? (
                <Link 
                  href={`/client/projects/₹{project.id}`}
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  View <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              ) : (
                <BidFormModal
                  projectId={project.id}
                  projectTitle={project.title}
                  projectBudget={project.budget}
                  projectDeadline={project.deadline}
                />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}