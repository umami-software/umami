import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { removeItem } from 'next-basics';
import { AUTH_TOKEN } from 'lib/constants';
import { setUser } from 'store/app';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    removeItem(AUTH_TOKEN);
    router.push('/login');

    return () => setUser(null);
  }, []);

  return null;
}
