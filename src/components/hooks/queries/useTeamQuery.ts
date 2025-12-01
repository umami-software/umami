import { keepPreviousData } from '@tanstack/react-query';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useTeamQuery(teamId: string, options?: ReactQueryOptions) {
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
