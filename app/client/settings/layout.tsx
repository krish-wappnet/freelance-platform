'use client'

import { useAuth } from '@/lib/client-auth';
import SidebarClient from '@/components/dashboard/sidebar-client';
import { redirect } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen">
        {/* Desktop Sidebar Skeleton */}
        <div className="hidden md:block w-64 border-r bg-muted/40">
          <div className="p-6 space-y-6">
            <Skeleton className="h-8 w-32" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Content Skeleton */}
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-[200px]" />
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[200px] w-full" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarClient user={user} role="CLIENT" />
      </div>

      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
} 