'use client'

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import ProjectFormClient from './project-form-client';

export default function ProjectFormHandler() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const budget = parseFloat(formData.get('budget') as string);
      const deadline = formData.get('deadline') as string;
      const skills = formData.get('skills') as string;
      const skillsArray = skills.split(',').map(skill => skill.trim());

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          budget,
          deadline,
          skills: skillsArray,
          category: 'General',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create project');
      }

      toast.success('Project created successfully');
      router.push('/client/dashboard');
      return true;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return <ProjectFormClient onSubmit={handleSubmit} />;
}
