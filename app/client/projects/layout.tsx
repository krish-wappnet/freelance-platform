import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'CLIENT') {
    redirect('/login');
  }

  return children;
}
