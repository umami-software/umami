import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useApi from 'hooks/useApi';
import { setUser } from 'store/app';
import { removeClientAuthToken } from 'lib/client';

export default function LogoutPage() {
  const router = useRouter();
  const { post } = useApi();

  useEffect(() => {
    async function logout() {
      await post('/logout');
    }

    removeClientAuthToken();

    logout();

    router.push('/login');

    return () => setUser(null);
  }, []);

  return null;
}
