import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import ProjectFormHandler from '@/components/projects/project-form-handler';

export default async function NewProjectPage() {
  const user = await getCurrentUser();

  if (!hasRole(user, UserRole.CLIENT, UserRole.ADMIN)) {
    redirect('/freelancer/dashboard');
  }

  return <ProjectFormHandler />;
}
