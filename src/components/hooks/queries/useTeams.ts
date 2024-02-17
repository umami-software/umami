import useApi from './useApi';
import useFilterQuery from './useFilterQuery';
import useModified from '../useModified';

export function useTeams(userId: string) {
  const { get } = useApi();
  const { modified } = useModified(`teams`);

  return useFilterQuery({
    queryKey: ['teams', { userId, modified }],
    queryFn: (params: any) => {
      return get(`/users/${userId}/teams`, params);
    },
  });
}

export default useTeams;
