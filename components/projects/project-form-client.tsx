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
    <Card className="w-full max-w-2xl mx-auto">
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
