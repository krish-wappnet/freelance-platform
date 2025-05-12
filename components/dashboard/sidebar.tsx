"use client";

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
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

export default function Sidebar({ user, role }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

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

  // Generate the appropriate nav items based on user role
  const clientNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/client/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      title: 'My Projects',
      href: '/client/projects',
      icon: <Briefcase className="h-5 w-5" />
    },
    {
      title: 'Received Bids',
      href: '/client/bids',
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: 'Active Contracts',
      href: '/client/contracts',
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      title: 'Messages',
      href: '/client/messages',
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      title: 'Settings',
      href: '/client/settings',
      icon: <Settings className="h-5 w-5" />
    },
    {
      title: 'Help',
      href: '/client/help',
      icon: <HelpCircle className="h-5 w-5" />
    }
  ];

  const freelancerNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/freelancer/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      title: 'Find Projects',
      href: '/projects',
      icon: <Briefcase className="h-5 w-5" />
    },
    {
      title: 'My Bids',
      href: '/freelancer/bids',
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: 'Active Contracts',
      href: '/freelancer/contracts',
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      title: 'Messages',
      href: '/freelancer/messages',
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      title: 'Settings',
      href: '/freelancer/settings',
      icon: <Settings className="h-5 w-5" />
    },
    {
      title: 'Help',
      href: '/freelancer/help',
      icon: <HelpCircle className="h-5 w-5" />
    }
  ];

  const navItems = role === 'CLIENT' ? clientNavItems : freelancerNavItems;

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

  const NavLinks = () => (
    <>
      <div className="flex items-center justify-between px-4 py-2">
        <div className={cn("flex items-center gap-2", isCollapsed && "justify-center w-full")}>
          <Zap className="h-6 w-6 text-primary" />
          {!isCollapsed && <span className="text-xl font-bold">WorkWave</span>}
        </div>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            <ChevronLeft className={cn("h-4 w-4", isCollapsed && "rotate-180")} />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}
      </div>
      
      <div className="px-3 py-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-secondary",
                pathname === item.href ? "bg-secondary text-primary" : "text-muted-foreground",
                isCollapsed && "justify-center px-2"
              )}
            >
              {item.icon}
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="mt-auto px-3 py-2">
        <div className="space-y-1">
          {bottomNavItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-secondary",
                pathname === item.href ? "bg-secondary text-primary" : "text-muted-foreground",
                isCollapsed && "justify-center px-2"
              )}
            >
              {item.icon}
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="border-t px-3 py-2">
        <div
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2",
            isCollapsed && "justify-center px-2 flex-col gap-1"
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || undefined} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">{user.name}</span>
              <span className="text-xs text-muted-foreground mt-1">{user.email}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px]">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex flex-col">
              <ScrollArea className="flex-1">
                <NavLinks />
              </ScrollArea>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold">WorkWave</span>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary"></span>
            </Button>
            
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar || undefined} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-50 h-full border-r bg-background',
        isCollapsed ? 'w-16' : 'w-64',
        isMobile ? 'md:w-64' : 'w-64'
      )}
    >
      <ScrollArea className="flex-1">
        <NavLinks />
      </ScrollArea>
    </div>
  );
}