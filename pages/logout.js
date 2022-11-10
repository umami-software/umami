import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { removeItem, useApi } from 'next-basics';
import { AUTH_TOKEN } from 'lib/constants';
import { setUser } from 'store/app';

export default function LogoutPage() {
  const router = useRouter();
  const { post } = useApi();

  useEffect(() => {
    async function logout() {
      await post('/logout');
    }

    removeItem(AUTH_TOKEN);

    logout();

    router.push('/login');

    return () => setUser(null);
  }, []);

  return null;
}
