'use client'

import { useAuth } from '@/lib/client-auth';
import SidebarClient from '@/components/dashboard/sidebar-client';
import { redirect } from 'next/navigation';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen">
      <SidebarClient user={user} role="FREELANCER" />
      <main className="flex-1 overflow-y-auto pl-16">
        {children}
      </main>
    </div>
  );
} 