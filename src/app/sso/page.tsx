'use client';
import { useEffect } from 'react';
import { Loading } from 'react-basics';
import { useRouter } from 'next/navigation';
import { setClientAuthToken } from 'lib/client';

export default function ({ params }) {
  const router = useRouter();
  const { token, url } = params;

  useEffect(() => {
    if (url && token) {
      setClientAuthToken(token);

      router.push(url);
    }
  }, [router, url, token]);

  return <Loading size="xl" />;
}
