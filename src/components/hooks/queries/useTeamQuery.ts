import { useApi } from '../useApi';
import { useModified } from '@/components/hooks';
import { keepPreviousData } from '@tanstack/react-query';
import { ReactQueryOptions } from '@/lib/types';

export function useTeamQuery(teamId: string, options?: ReactQueryOptions<any>) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`teams:${teamId}`);

  return useQuery({
    queryKey: ['teams', { teamId, modified }],
    queryFn: () => get(`/teams/${teamId}`),
    enabled: !!teamId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
