'use client'

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProjectFormClient from './project-form-client';

interface ProjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: (project: any) => void;
}

export default function ProjectFormModal({ open, onOpenChange, onProjectCreated }: ProjectFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <ProjectFormClient onSubmit={async (formData) => {
          try {
            const response = await fetch('/api/projects', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                budget: parseFloat(formData.get('budget') as string),
                deadline: formData.get('deadline') as string,
                skills: (formData.get('skills') as string).split(',').map(skill => skill.trim()),
                category: 'General',
                features: Array.from(formData.getAll('features')) as string[],
                type: formData.get('type') as string,
                experienceLevel: formData.get('experienceLevel') as string,
                deliverables: Array.from(formData.getAll('deliverables')) as string[],
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to create project');
            }

            const project = await response.json();
            onOpenChange(false);
            onProjectCreated?.(project);
            return true;
          } catch (error) {
            console.error('Error creating project:', error);
            throw error;
          }
        }} />
      </DialogContent>
    </Dialog>
  );
}
