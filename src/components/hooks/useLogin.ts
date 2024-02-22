import useApi from 'components/hooks/useApi';
import useUser from 'components/hooks/useUser';

export function useLogin() {
  const { get, useQuery } = useApi();
  const { user, setUser } = useUser();

  const query = useQuery({
    queryKey: ['login'],
    queryFn: async () => {
      const data = await get('/auth/verify');

      setUser(data);

      return data;
    },
  });

  return { user, ...query };
}

export default useLogin;
