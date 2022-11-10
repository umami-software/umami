import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { setItem } from 'next-basics';
import { AUTH_TOKEN } from 'lib/constants';

export default function SingleSignOnPage() {
  const router = useRouter();
  const { token, url } = router.query;

  useEffect(() => {
    if (url && token) {
      setItem(AUTH_TOKEN, token);

      router.push(url);
    }
  }, [router, url, token]);

  return null;
}
