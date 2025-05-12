'use client'

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/client-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import BidForm from '@/app/client/components/projects/BidForm';

export default function BidPage() {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        setProject(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load project details',
          variant: 'destructive',
        });
        router.push('/freelancer/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId, router, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p className="text-lg font-medium">Project not found</p>
        <Button onClick={() => router.push('/freelancer/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Submit Bid</h1>
        <Button
          variant="outline"
          onClick={() => router.push('/freelancer/dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{project.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground line-clamp-3">
              {project.description}
            </p>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Budget:</span>
                  <span className="ml-2">₹{project.budget.toLocaleString()}</span>
                </div>
                {project.deadline && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Deadline:</span>
                    <span className="ml-2">{project.deadline}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Skills:</span>
                <span className="ml-2">{project.skills.join(', ')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <BidForm
        projectId={projectId}
        projectBudget={project.budget}
        onBack={() => router.push('/freelancer/dashboard')}
      />
    </div>
  );
}
