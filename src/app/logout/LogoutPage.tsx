'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useApi } from '@/components/hooks';
import { removeClientAuthToken } from '@/lib/client';
import { setUser } from '@/store/app';

export function LogoutPage() {
  const router = useRouter();
  const { post } = useApi();

  useEffect(() => {
    async function logout() {
      try {
        // Sent before the token is removed: the server ends the session it authenticates.
        await post('/auth/logout');
      } catch {
        // The local logout below must still happen if the server call fails.
      } finally {
        removeClientAuthToken();
        setUser(null);
        window.location.href = `${process.env.basePath || ''}/login`;
      }
    }

    logout();
  }, [router, post]);

  return null;
}
