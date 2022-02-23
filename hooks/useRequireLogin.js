import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useUser from 'hooks/useUser';
import { get } from 'lib/web';

export default function useRequireLogin() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);

  async function loadUser() {
    setLoading(true);

    const { ok, data } = await get(`${router.basePath}/api/auth/verify`);

    if (!ok) {
      return router.push('/login');
    }

    setUser(data);

    setLoading(false);
  }

  useEffect(() => {
    if (!loading && user) {
      return;
    }

    loadUser();
  }, []);

  return { user, loading };
}
