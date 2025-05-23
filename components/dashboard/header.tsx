"use client"

import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

export default function DashboardHeader() {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h1 className="text-2xl font-bold">Dashboard</h1>
  
    </div>
  );
}
