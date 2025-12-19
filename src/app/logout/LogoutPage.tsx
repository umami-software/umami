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
      await post('/auth/logout');

      window.location.href = `${process.env.basePath || ''}/login`;
    }

    removeClientAuthToken();
    setUser(null);
    logout();
  }, [router, post]);

  return null;
}
