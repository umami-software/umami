import { useEffect } from 'react';
import useApi from 'components/hooks/useApi';
import useUser from 'components/hooks/useUser';

export function useRequireLogin() {
  const { get } = useApi();
  const { user, setUser } = useUser();

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await get('/auth/verify');

        setUser(data);
      } catch {
        window.location.href = `${process.env.basePath || ''}/login`;
      }
    }

    if (!user) {
      loadUser();
    }
  }, [user]);

  return { user };
}

export default useRequireLogin;
