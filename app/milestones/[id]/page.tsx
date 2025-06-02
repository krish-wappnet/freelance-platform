import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function MilestoneRedirectPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return notFound();
  }

  if (user.role === 'CLIENT') {
    redirect(`/client/milestones/${params.id}`);
  } else if (user.role === 'FREELANCER') {
    redirect(`/freelancer/milestones/${params.id}`);
  } else if (user.role === 'ADMIN') {
    // Admins can see either, default to client view or make a special admin view if needed
    redirect(`/client/milestones/${params.id}`);
  } else {
    return notFound();
  }

  // Fallback (should never hit)
  return null;
} 