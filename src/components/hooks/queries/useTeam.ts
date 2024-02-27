import useApi from './useApi';

export function useTeam(teamId: string) {
  const { get, useQuery } = useApi();
  return useQuery({
    queryKey: ['teams', teamId],
    queryFn: () => get(`/teams/${teamId}`),
    enabled: !!teamId,
  });
}

export default useTeam;
