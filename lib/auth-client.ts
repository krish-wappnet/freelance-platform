'use client'

import { UserRole } from '@prisma/client';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
