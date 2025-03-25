import { UseQueryResult } from '@tanstack/react-query';
import useStore, { setUser } from '@/store/app';
import { useApi } from '../useApi';

const selector = (state: { user: any }) => state.user;

export function useLogin(): {
  user: any;
  setUser: (data: any) => void;
} & UseQueryResult {
  const { get, useQuery } = useApi();
  const user = useStore(selector);

  const query = useQuery({
    queryKey: ['login'],
    queryFn: async () => {
      const data = await get('/auth/verify');

      setUser(data);

      return data;
    },
    enabled: !user,
  });

  return { user, setUser, ...query };
}

export default useLogin;
