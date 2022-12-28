import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useStore, { setUser } from 'store/app';
import useApi from 'hooks/useApi';

const selector = state => state.user;
let loading = false;

export default function useUser() {
  const user = useStore(selector);
  const { get } = useApi();
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const { user } = await get('/auth/verify');
      loading = false;

      if (!user) {
        await router.push('/login');
      } else {
        setUser(user);
      }
    }

    if (!user && !loading) {
      loading = true;
      loadUser();
    }
  }, [user, get, router]);

  return user;
}
