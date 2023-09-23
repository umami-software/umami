import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useApi from 'components/hooks/useApi';
import useUser from 'components/hooks/useUser';

export function useRequireLogin(handler: (data?: object) => void) {
  const { basePath } = useRouter();
  const { get } = useApi();
  const { user, setUser } = useUser();

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await get('/auth/verify');

        setUser(typeof handler === 'function' ? handler(data) : (data as any)?.user);
      } catch {
        location.href = `${basePath}/login`;
      }
    }

    if (!user) {
      loadUser();
    }
  }, [user]);

  return { user };
}

export default useRequireLogin;
