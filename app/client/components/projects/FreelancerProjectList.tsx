'use client'

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Briefcase, Users, Clock, Calendar, DollarSign, ExternalLink, FileText, CheckCircle2, XCircle } from 'lucide-react';


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
  client: {
    name: string;
    avatar: string | null;
    email: string;
  };
}

interface Filter {
  status: 'all' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

interface FreelancerProjectListProps {
  projects: Project[];
}

export default function FreelancerProjectList({ projects }: FreelancerProjectListProps) {
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [filter, setFilter] = useState<Filter>({
    status: 'all',
  });

  const handleFilterChange = (newFilter: Filter) => {
    setFilter(newFilter);
    if (newFilter.status === 'all') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(
        projects.filter((project) => project.status === newFilter.status)
      );
    }
  };

  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBid = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setBidModalOpen(true);
    }
  };

  const handleSubmitBid = async () => {
    if (!selectedProject) {
      alert('Project not selected');
      return;
    }

    const amount = parseInt(bidAmount);
    const time = parseInt(deliveryTime);

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    if (isNaN(time) || time <= 0) {
      alert('Please enter a valid delivery time');
      return;
    }

    if (!coverLetter.trim()) {
      alert('Please write a cover letter');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/projects/${selectedProject.id}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseInt(bidAmount),
          deliveryTime: parseInt(deliveryTime),
          coverLetter: coverLetter,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit bid');
      }

      // Refresh the projects list
      const refreshResponse = await fetch('/api/projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh projects');
      }

      const updatedProjects = await refreshResponse.json();
      setFilteredProjects(updatedProjects);
      setBidModalOpen(false);
      setSelectedProject(null);
      setBidAmount('');
      setDeliveryTime('');
      setCoverLetter('');
      alert('Bid submitted successfully!');
    } catch (error) {
      console.error('Error submitting bid:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Available Projects</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleFilterChange({ status: 'all' })}>
            All Projects
          </Button>
          <Button variant="outline" onClick={() => handleFilterChange({ status: 'PENDING' })}>
            Pending
          </Button>
          <Button variant="outline" onClick={() => handleFilterChange({ status: 'IN_PROGRESS' })}>
            In Progress
          </Button>
          <Button variant="outline" onClick={() => handleFilterChange({ status: 'COMPLETED' })}>
            Completed
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="h-[400px]">
            <CardHeader className="h-20">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <Badge variant="outline">{project.status}</Badge>
              </div>
              <CardDescription className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    ₹{project.budget.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {project.bids.length} bids
                  </span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[240px]">
              <div className="space-y-4 h-full">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">₹{project.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">
                        {project.deadline ?
                          `Deadline: ${new Date(project.deadline).toLocaleDateString()}` :
                          'No deadline'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">
                        Posted: {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">
                        {project.bids.length} bids
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Link href={`/freelancer/projects/${project.id}`}>
                <Button variant="outline" className="w-full">
                  View Project Details
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Dialog open={bidModalOpen} onOpenChange={(open) => {
                if (!open) {
                  setBidAmount('');
                  setDeliveryTime('');
                  setCoverLetter('');
                }
                setBidModalOpen(open);
              }}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    onClick={() => handleBid(project.id)}
                  >
                    Submit Bid
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit Bid</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Bid Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder="Enter bid amount"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="deliveryTime">Delivery Time (days)</Label>
                      <Input
                        id="deliveryTime"
                        type="number"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        placeholder="Enter delivery time in days"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="coverLetter">Cover Letter</Label>
                      <Textarea
                        id="coverLetter"
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Write your cover letter here..."
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setBidModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitBid}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Bid'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
