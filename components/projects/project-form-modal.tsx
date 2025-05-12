'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProjectFormClient from './project-form-client';

export default function ProjectFormModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-primary hover:bg-primary/90"
      >
        Create Project
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
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
                }),
              });

              if (!response.ok) {
                throw new Error('Failed to create project');
              }

              setOpen(false);
              return true;
            } catch (error) {
              console.error('Error creating project:', error);
              throw error;
            }
          }} />
        </DialogContent>
      </Dialog>
    </>
  );
}
