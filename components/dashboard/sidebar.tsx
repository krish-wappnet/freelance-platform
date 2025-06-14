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
  ChevronRight,
  Menu,
  Zap,
  Bell,
  Milestone,
  LogOut,
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
  onNavigate?: () => void;
}

export default function Sidebar({ user, role, activePath, onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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
      href: role === 'CLIENT' ? '/milestones' : '/milestones',
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

  // Update main content margin when sidebar state changes
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      if (isCollapsed) {
        mainContent.classList.remove('md:ml-[200px]', 'lg:ml-[250px]');
        mainContent.classList.add('md:ml-16', 'lg:ml-16');
      } else {
        mainContent.classList.remove('md:ml-16', 'lg:ml-16');
        mainContent.classList.add('md:ml-[200px]', 'lg:ml-[250px]');
      }
    }
  }, [isCollapsed]);

  // Mobile menu content component
  const MobileMenuContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-bold">WorkWave</span>
        </div>
      </div>

      <div className="flex items-center p-4 border-b">
        <Avatar className="h-10 w-10 ring-2 ring-primary/10">
          <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {user?.name?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <span className="font-medium">{user?.name || 'User'}</span>
          <span className="block text-sm text-muted-foreground">
            {role === 'CLIENT' ? 'Client' : 'Freelancer'}
          </span>
        </div>
      </div>

      <div className="flex-1 py-2">
        <div className="px-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium',
                  pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-md",
                  pathname === item.href ? "bg-primary/20" : "bg-transparent"
                )}>
                  {item.icon}
                </div>
                <span className="ml-3">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="flex items-center gap-2 w-full text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => {
            fetch('/api/auth/logout', { method: 'POST' })
              .then(() => window.location.href = '/login')
              .catch(err => console.error('Logout error:', err));
          }}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );

  // Update the Link components to use onNavigate
  const NavLink = ({ item }: { item: NavItem }) => (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'group flex items-center rounded-lg px-2 py-1.5 text-sm font-medium transition-all duration-300',
        activePath === item.href
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        isCollapsed ? 'justify-center' : 'justify-start'
      )}
    >
      <div className={cn(
        "p-1.5 rounded-md transition-all duration-300",
        activePath === item.href ? "bg-primary/20" : "bg-transparent group-hover:bg-background/50",
        isCollapsed ? "p-1.5" : "p-1.5"
      )}>
        {React.cloneElement(item.icon, { 
          className: cn(
            'transition-all duration-300',
            isCollapsed ? 'h-5 w-5' : 'h-5 w-5'
          )
        })}
      </div>
      <span className={cn(
        "transition-all duration-300",
        isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-2"
      )}>
        {item.title}
      </span>
    </Link>
  );

  return (
    <>
      {/* Mobile Menu Trigger */}
      <div className="md:hidden fixed top-0 left-0 z-[60] h-screen flex items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-12 w-6 rounded-r-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg border border-l-0 hover:bg-accent"
            >
              {isOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="p-0 w-[280px] border-r"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <MobileMenuContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out shadow-lg',
          isCollapsed ? 'w-[72px]' : 'w-64',
          isMobile ? 'hidden md:block' : ''
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className={cn(
              "flex items-center gap-2 transition-all duration-300",
              isCollapsed ? "justify-center w-full" : "w-auto"
            )}>
              <div className={cn(
                "p-1.5 rounded-lg bg-primary/10 transition-all duration-300",
                isCollapsed ? "p-2" : "p-1.5"
              )}>
                <Zap className={cn(
                  "text-primary transition-all duration-300",
                  isCollapsed ? "h-7 w-7" : "h-6 w-6"
                )} />
              </div>
              <span className={cn(
                "text-xl font-bold transition-all duration-300",
                isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              )}>
                WorkWave
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "h-8 w-8 hover:bg-primary/10 rounded-full transition-all duration-300",
                isCollapsed ? "absolute -right-4 top-6 bg-background shadow-md border" : "absolute -right-4 top-6 bg-background shadow-md border"
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-primary" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-primary" />
              )}
            </Button>
          </div>

          {/* User Profile */}
          <div className={cn(
            "flex items-center justify-center p-2 border-b transition-all duration-300",
            isCollapsed ? "py-3" : ""
          )}>
            <Avatar className={cn(
              "transition-all duration-300 ring-2 ring-primary/10",
              isCollapsed ? "h-10 w-10" : "h-8 w-8"
            )}>
              <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "flex flex-col transition-all duration-300",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 ml-2"
            )}>
              <span className="font-medium text-sm">{user?.name || 'User'}</span>
              <span className="text-xs text-muted-foreground">
                {role === 'CLIENT' ? 'Client' : 'Freelancer'}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 py-2">
            <div className={cn(
              "px-2 transition-all duration-300",
              isCollapsed ? "px-2" : "px-3"
            )}>
              <div className="space-y-0.5">
                {navItems.map((item) => (
                  <NavLink key={item.title} item={item} />
                ))}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="border-t p-2 mt-auto mb-4">
            <div className="flex items-center justify-center">
              <Button
                variant="ghost"
                className={cn(
                  "flex items-center gap-2 w-full transition-all duration-300",
                  isCollapsed ? "px-1 justify-center" : "px-3"
                )}
                onClick={() => {
                  fetch('/api/auth/logout', { method: 'POST' })
                    .then(() => window.location.href = '/login')
                    .catch(err => console.error('Logout error:', err));
                }}
              >
                <div className={cn(
                  "p-1.5 rounded-md bg-red-500/10 transition-all duration-300",
                  isCollapsed ? "p-1.5" : "p-1.5"
                )}>
                  <LogOut className={cn(
                    "text-red-500 transition-all duration-300",
                    isCollapsed ? "h-5 w-5" : "h-5 w-5"
                  )} />
                </div>
                <span className={cn(
                  "text-sm font-medium transition-all duration-300",
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}>
                  Logout
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Add padding to main content on mobile */}
      <div className="md:hidden w-6" />
    </>
  );
}