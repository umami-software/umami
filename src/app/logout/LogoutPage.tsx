'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/components/hooks';
import { setUser } from '@/store/app';
import { removeClientAuthToken } from '@/lib/client';

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
