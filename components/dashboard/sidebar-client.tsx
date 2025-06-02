'use client'

import { usePathname } from 'next/navigation';
import Sidebar from './sidebar';

interface SidebarClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
  };
  role: 'CLIENT' | 'FREELANCER';
  onNavigate?: () => void;
}

export default function SidebarClient({ user, role, onNavigate }: SidebarClientProps) {
  const pathname = usePathname();

  return <Sidebar user={user} role={role} activePath={pathname} onNavigate={onNavigate} />;
}
