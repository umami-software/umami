'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useApi from 'components/hooks/useApi';
import { setUser } from 'store/app';
import { removeClientAuthToken } from 'lib/client';

async function getDisabled() {
  return !!(process.env.DISABLE_LOGIN || process.env.CLOUD_MODE);
}

export default async function LogoutPage() {
  const disabled = await getDisabled();
  const router = useRouter();
  const { post } = useApi();

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
