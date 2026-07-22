'use client';
import { useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { setUser } from '@/store/app';

export function LogoutPage() {
  useEffect(() => {
    async function logout() {
      await authClient.signOut().catch(() => undefined);

      window.location.href = `${process.env.basePath || ''}/login`;
    }

    setUser(null);
    logout();
  }, []);

  return null;
}
