import useApi from './useApi';
import useFilterQuery from './useFilterQuery';
import useLogin from './useLogin';
import useModified from '../useModified';

export function useTeams(userId?: string) {
  const { get } = useApi();
  const { user } = useLogin();
  const id = userId || user?.id;
  const { modified } = useModified(`teams`);

  return useFilterQuery({
    queryKey: ['teams', { userId: id, modified }],
    queryFn: (params: any) => {
      return get(`/teams`, params);
    },
  });
}

export default useTeams;
