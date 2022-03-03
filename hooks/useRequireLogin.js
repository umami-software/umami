import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useUser from 'hooks/useUser';
import useApi from 'hooks/useApi';

export default function useRequireLogin() {
  const router = useRouter();
  const { get } = useApi();
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);

  async function loadUser() {
    setLoading(true);

    const { ok, data } = await get('/auth/verify');

    if (!ok) {
      await router.push('/login');
      return null;
    }

    setUser(data);

    setLoading(false);
  }

  useEffect(() => {
    if (loading || user) {
      return;
    }

    loadUser();
  }, [user, loading]);

  return { user, loading };
}
