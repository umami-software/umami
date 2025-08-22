'use client';

import { setClientAuthToken } from '@/lib/client';
import { httpGet } from '@/lib/fetch';
import { setUser } from '@/store/app';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function () {
  const router = useRouter();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    httpGet('/api/auth/login/oidc', Object.fromEntries(params.entries()))
      .then(response => {
        setClientAuthToken(response.data.token);
        setUser(response.data.user);

        router.push('/dashboard');
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error(err);
      });
  }, []);
}
