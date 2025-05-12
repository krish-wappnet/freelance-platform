'use client'

import { Button } from '@/components/ui/button';
import { Bell, User, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-client';
import { useEffect, useState } from 'react';
import { AuthUser } from '@/lib/auth-client';

export function Header({ role }: { role: 'CLIENT' | 'FREELANCER' }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
    };

    fetchUser();
  }, []);

  return (
    <header className="border-b">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold">
            {role === 'CLIENT' ? 'Client Dashboard' : 'Freelancer Dashboard'}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
