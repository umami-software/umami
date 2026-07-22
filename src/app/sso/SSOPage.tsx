'use client';
import { Loading } from '@umami/react-zen';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

function isSafeRedirectUrl(url: string): boolean {
  // Must start with a single slash (relative path)
  // Block protocol handlers (javascript:, data:, etc.) and protocol-relative URLs (//)
  return url.startsWith('/') && !url.startsWith('//') && !url.includes(':');
}

export function SSOPage() {
  const router = useRouter();
  const search = useSearchParams();
  const url = search.get('url');
  const token = search.get('token');

  useEffect(() => {
    async function verify() {
      if (!isSafeRedirectUrl(url)) {
        router.push('/');
        return;
      }

      // Exchange the one-time SSO token for a session cookie.
      const res = await fetch(`${process.env.basePath || ''}/api/auth/sso/verify`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      }).catch(() => null);

      if (res?.ok) {
        router.push(url);
      } else {
        router.push('/');
      }
    }

    if (url && token) {
      verify();
    }
  }, [router, url, token]);

  return <Loading placement="absolute" />;
}
