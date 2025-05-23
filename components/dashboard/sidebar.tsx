"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  CreditCard,
  Settings,
  HelpCircle,
  ChevronLeft,
  Menu,
  Zap,
  Bell,
  Milestone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavItem {
  title: string;
  href: string;
  icon: React.JSX.Element;
}

interface SidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
  };
  role: 'CLIENT' | 'FREELANCER';
  activePath: string;
}

export default function Sidebar({ user, role, activePath }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Generate the appropriate nav items based on user role
  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: role === 'CLIENT' ? '/client/dashboard' : '/freelancer/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      title: 'Projects',
      href: role === 'CLIENT' ? '/client/projects/list' : '/freelancer/projects',
      icon: <Briefcase className="h-5 w-5" />
    },
    {
      title: 'Bids',
      href: role === 'CLIENT' ? '/client/bids' : '/freelancer/bids',
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: 'Contracts',
      href: role === 'CLIENT' ? '/client/contracts/list' : '/freelancer/contracts',
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      title: 'Milestones',
      href: role === 'CLIENT' ? '/dashboard/milestones' : '/freelancer/milestones',
      icon: <Milestone className="h-5 w-5" />
    },
    {
      title: 'Settings',
      href: role === 'CLIENT' ? '/client/settings' : '/freelancer/settings',
      icon: <Settings className="h-5 w-5" />
    },
    {
      title: 'Help',
      href: role === 'CLIENT' ? '/client/help' : '/freelancer/help',
      icon: <HelpCircle className="h-5 w-5" />
    }
  ];

  // Detect if mobile on mount
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);



  const bottomNavItems: NavItem[] = [
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="h-5 w-5" />,
    },
    {
      title: 'Help & Support',
      href: '/help',
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ];

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-50 h-full border-r bg-background',
        isCollapsed ? 'w-16' : 'w-64',
        isMobile ? 'md:w-64' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className={cn("flex items-center gap-2", isCollapsed && "justify-center w-full")}>
          <Zap className="h-6 w-6 text-primary" />
          {!isCollapsed && <span className="text-xl font-bold">WorkWave</span>}
        </div>
      </div>
      <div className="flex h-screen flex-col">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:hidden h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
              <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user?.name || 'User'}</span>
              <span className="text-sm text-muted-foreground">
                {role === 'CLIENT' ? 'Client' : 'Freelancer'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="px-4 py-2">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={cn(
                      'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted',
                      pathname === item.href
                        ? 'bg-muted text-primary'
                        : 'text-muted-foreground'
                    )}
                  >
                    {React.cloneElement(item.icon, { className: 'mr-2 h-4 w-4' })}
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t p-4">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="destructive"
                className="flex items-center gap-2 bg-black hover:bg-black/90 text-white px-6 py-2 rounded-lg transition-all duration-200 min-w-[180px]"
                onClick={() => {
                  fetch('/api/auth/logout', { method: 'POST' })
                    .then(() => window.location.href = '/login')
                    .catch(err => console.error('Logout error:', err));
                }}
              >
                <Zap className="h-5 w-5" />
                <span className="text-sm font-medium">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}