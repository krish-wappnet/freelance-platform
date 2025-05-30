import { getCurrentUser } from '@/lib/auth';
import Sidebar from '@/components/dashboard/sidebar';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { redirect } from 'next/navigation';

export default async function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'FREELANCER') {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar 
        user={user}
        role={user.role as 'CLIENT' | 'FREELANCER'}
        activePath="/freelancer"
      />
      <main className="flex-1 ml-0 md:ml-[200px] lg:ml-[250px]">
        <div className="border-b">
          <div className="flex items-center justify-between h-16 px-4">
            <h1 className="text-lg font-semibold">Freelancer Dashboard</h1>
            <NotificationBell />
          </div>
        </div>
        <div>
          {children}
        </div>
      </main>
    </div>
  );
}
