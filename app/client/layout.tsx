import { getCurrentUser } from '@/lib/auth';
import Sidebar from '@/components/dashboard/sidebar';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { redirect } from 'next/navigation';

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  // Debug information
  console.log('Client Layout - Auth Status:', {
    isAuthenticated: !!user,
    userRole: user?.role,
    userId: user?.id,
  });

  if (!user) {
    console.log('Client Layout - Redirecting to login: No user found');
    redirect('/login');
  }

  // Optional: Redirect non-clients away from /client routes
  if (user.role !== 'CLIENT') {
    console.log('Client Layout - Redirecting to dashboard: Invalid role', { role: user.role });
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar 
        user={user}
        role={user.role as 'CLIENT' | 'FREELANCER'}
        activePath="/client"
      />
      <main className="flex-1 ml-0 md:ml-[200px] lg:ml-[250px] transition-all duration-300">
        <div className="border-b">
          <div className="flex items-center justify-between h-16 px-4">
            <h1 className="text-lg font-semibold">Client Dashboard</h1>
            <NotificationBell />
          </div>
        </div>
        <div className="p-8 pt-6">
          {children}
        </div>
      </main>
    </div>
  );
} 