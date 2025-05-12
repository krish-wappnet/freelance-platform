import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import SidebarClient from '@/components/dashboard/sidebar-client';
import DashboardHeader from '@/components/dashboard/header';

export default async function DashboardLayout({
  children,
  role,
}: {
  children: React.ReactNode;
  role: 'CLIENT' | 'FREELANCER';
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen">
      <SidebarClient user={user} role={role} />
      <main className="flex-1 overflow-y-auto pl-64">
        <DashboardHeader />
        {children}
      </main>
    </div>
  );
}