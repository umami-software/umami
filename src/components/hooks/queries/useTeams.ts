import useApi from './useApi';
import useFilterQuery from './useFilterQuery';
import { useLogin } from 'components/hooks';
import useModified from 'store/modified';

export function useTeams(userId?: string) {
  const { get } = useApi();
  const { user } = useLogin();
  const modified = useModified((state: any) => state?.teams);

  return useFilterQuery({
    queryKey: ['teams', { userId: userId || user?.id, modified }],
    queryFn: (params: any) => {
      return get(`/teams`, params);
    },
  });
}

export default useTeams;
