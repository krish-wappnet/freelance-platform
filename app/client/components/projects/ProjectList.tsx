'use client'

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Briefcase, Users, Clock, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: Date | null;
  category: string;
  skills: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
  clientId: string;
  bids: {
    id: string;
    amount: number;
    deliveryTime: number;
    coverLetter: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
    freelancerId: string;
    freelancer: {
      name: string;
      avatar: string | null;
    };
  }[];
}

interface Filter {
  status: 'all' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  const [filter, setFilter] = useState<Filter>({
    status: 'all',
  });

  const filteredProjects = projects.filter(project => {
    if (filter.status === 'all') return true;
    return project.status === filter.status;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Projects</h2>
        <Link href="/client/projects/new">
          <Button>Create New Project</Button>
        </Link>
      </div>

      <Card>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No projects yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create a new project to get started
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="p-4">
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <h3 className="font-medium">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {project.skills.join(', ')}
                        </p>
                      </div>
                      <Select
                        value={project.status}
                        onValueChange={(value) => {
                          // TODO: Implement status update
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-muted-foreground">{project.description}</p>
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">₹{project.budget}</span>
                            </div>
                            {project.deadline && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm text-muted-foreground">
                                  {formatDistanceToNow(new Date(project.deadline), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4" />
                              <span className="text-sm text-muted-foreground">
                                {project.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(project.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">
                            {project.status}
                          </Badge>
                          <Badge variant="outline">
                            {project.bids.length} bids
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <Link href={`/client/projects/${project.id}`}>
                        <Button variant="outline" className="w-full">
                          View Project Details
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
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
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardFooter>
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
