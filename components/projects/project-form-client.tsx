'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ProjectFormClient({ onSubmit }: { onSubmit: (data: FormData) => Promise<boolean> }) {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const success = await onSubmit(formData);
      if (success) {
        toast.success('Project created successfully');
        router.refresh();
      }
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto h-[calc(100vh-200px)] overflow-y-auto">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold">Create New Project</CardTitle>
        <p className="text-muted-foreground">Fill in the details to create a new project</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Project Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter project title"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Project Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter project description"
              className="w-full min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-sm font-medium">
                Budget <span className="text-red-500">*</span>
              </Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                placeholder="Enter budget"
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-sm font-medium">
                Deadline <span className="text-red-500">*</span>
              </Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                className="w-full"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills" className="text-sm font-medium">
              Required Skills <span className="text-red-500">*</span>
            </Label>
            <Input
              id="skills"
              name="skills"
              placeholder="Enter required skills (comma separated)"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Key Features</Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                'AUTHENTICATION', 'TASK_MANAGEMENT', 'FILTERING',
                'RESPONSIVE_UI', 'REST_API', 'DOCUMENTATION',
                'SOURCE_CODE', 'README', 'DEPLOYMENT_INSTRUCTIONS',
                'LIVE_DEMO'
              ].map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={feature}
                    name="features"
                    value={feature}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor={feature} className="text-sm">
                    {feature.replace('_', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Project Type</Label>
            <select
              id="type"
              name="type"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              defaultValue="ONE_TIME"
            >
              <option value="ONE_TIME">One-time Project</option>
              <option value="CONTINUOUS">Continuous Project</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Required Experience Level</Label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              defaultValue="INTERMEDIATE"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Deliverables</Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                'Source Code', 'Documentation', 'Deployment Instructions',
                'Live Demo'
              ].map((deliverable) => (
                <div key={deliverable} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={deliverable}
                    name="deliverables"
                    value={deliverable}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor={deliverable} className="text-sm">
                    {deliverable}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="w-48">
              Create Project
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
