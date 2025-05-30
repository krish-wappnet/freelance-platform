'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Briefcase, Clock, Calendar, DollarSign, Users, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/client-auth';
import Image from 'next/image';

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string | null;
  category: string;
  skills: string[];
  status: string;
  features: string[];
  type: string;
  timelineWeeks: number;
  experienceLevel: string;
  deliverables: string[];
  client: {
    id: string;
    name: string;
    avatar: string | null;
    email: string;
  };
  proposals: {
    id: string;
    amount: number;
    deliveryTime: number;
    coverLetter: string;
    status: string;
    freelancer: {
      id: string;
      name: string;
      avatar: string | null;
      skills: string[];
    };
  }[];
  contracts: {
    id: string;
    title: string;
    description: string;
    amount: number;
    stage: string;
    startDate: string | null;
    endDate: string | null;
    termsAccepted: boolean;
    milestones: {
      id: string;
      title: string;
      description: string;
      amount: number;
      dueDate: string | null;
      status: string;
    }[];
  }[];
}

export default function ProjectDetails() {
  const { id } = useParams();
  const parsedId = typeof id === 'string' ? id : id[0];
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${encodeURIComponent(parsedId)}`);
        if (!response.ok) throw new Error('Failed to fetch project');
        const data = await response.json();
        setProject(data.project);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    if (parsedId) {
      fetchProject();
    }
  }, [parsedId]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (!project) return <div className="flex items-center justify-center h-screen">Project not found</div>;

  const hasSubmittedBid = project.proposals.some(
    (proposal) => proposal.freelancer.id === user?.id
  );

  const handleBid = () => {
    router.push(`/freelancer/projects/${id}/bid`);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{project.title}</CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Briefcase className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">{project.category}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Deadline: {project.deadline ? format(new Date(project.deadline), 'MMM d, yyyy') : 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Budget: ₹{project.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Timeline: {project.timelineWeeks} weeks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Experience Level: {project.experienceLevel}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <Image
                      src={project.client.avatar || '/placeholder-avatar.png'}
                      alt={project.client.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{project.client.name}</h3>
                    <p className="text-sm text-muted-foreground">{project.client.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Description */}
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </CardContent>
            </Card>

            {/* Skills Required */}
            <Card>
              <CardHeader>
                <CardTitle>Skills Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {project.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {feature.replace('_', ' ')}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Deliverables */}
            <Card>
              <CardHeader>
                <CardTitle>Deliverables</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {project.deliverables.map((deliverable) => (
                    <li key={deliverable} className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-blue-500" />
                      {deliverable}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Submit Bid Button */}
            {!hasSubmittedBid && (
              <Card>
                <CardContent className="flex justify-center">
                  <Button onClick={handleBid} className="w-full">
                    Submit Bid
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
