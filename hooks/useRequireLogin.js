import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useApi from 'hooks/useApi';
import useUser from 'hooks/useUser';

export default function useRequireLogin() {
  const router = useRouter();
  const { get } = useApi();
  const { user, setUser } = useUser();

  useEffect(() => {
    async function loadUser() {
      try {
        const { user } = await get('/auth/verify');

        setUser(user);
      } catch {
        await router.push('/login');
      }
    }

    if (!user) {
      loadUser();
    }
  }, [user]);

  return { user };
}
