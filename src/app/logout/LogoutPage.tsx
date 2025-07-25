'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApi, useConfig } from '@/components/hooks';
import { setUser } from '@/store/app';
import { removeClientAuthToken } from '@/lib/client';

export function LogoutPage() {
  const config = useConfig();
  const router = useRouter();
  const { post } = useApi();
  const disabled = !!(config?.loginDisabled || process.env.cloudMode);

  useEffect(() => {
    async function logout() {
      await post('/auth/logout');
    }

    if (!disabled) {
      removeClientAuthToken();

      logout();

      router.push('/login');

      return () => setUser(null);
    }
  }, [disabled, router, post]);

  return null;
}

export default LogoutPage;
