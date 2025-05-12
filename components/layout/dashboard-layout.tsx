'use client'

import Sidebar from '@/components/dashboard/sidebar';
import { Header } from '@/components/header';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth-client';
import { AuthUser } from '@/lib/auth-client';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'CLIENT' | 'FREELANCER';
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
    };

    fetchUser();
  }, []);

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar user={user} role={role} activePath={pathname} />
      <div className="flex-1 flex flex-col pl-64">
        <Header role={role} />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
