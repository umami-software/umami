import useApi from './useApi';
import useFilterQuery from './useFilterQuery';
import { useLogin } from 'components/hooks';

export function useTeams(userId?: string) {
  const { get } = useApi();
  const { user } = useLogin();

  return useFilterQuery({
    queryKey: ['teams', { userId: userId || user?.id }],
    queryFn: (params: any) => {
      return get(`/teams`, params);
    },
  });
}

export default useTeams;
