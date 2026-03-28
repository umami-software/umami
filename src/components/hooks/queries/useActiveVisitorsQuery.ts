import { useApi } from '../useApi';

type QueryOptions = {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
};

export function useActiveVisitorsQuery(websiteId: string, options?: QueryOptions) {
  const { get, useQuery } = useApi();

  return useQuery<{ visitors: number }>({
    queryKey: ['websites:active', { websiteId }],
    queryFn: () => get(`/websites/${websiteId}/active`),
    refetchInterval: options?.refetchInterval ?? 15000,
    staleTime: options?.staleTime ?? 10000,
    enabled: !!websiteId && (options?.enabled ?? true),
  });
}
