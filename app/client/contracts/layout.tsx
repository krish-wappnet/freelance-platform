import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import Sidebar from '@/components/dashboard/sidebar';

export default async function ContractsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || (user.role !== UserRole.CLIENT && user.role !== UserRole.FREELANCER)) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen">
      <Sidebar user={user} role={user.role} activePath="/client/contracts" />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
