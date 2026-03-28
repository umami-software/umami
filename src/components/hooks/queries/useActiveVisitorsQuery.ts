import { useApi } from '../useApi';

export function useActiveVisitorsQuery(websiteId: string) {
  const { get, useQuery } = useApi();

  return useQuery<{ visitors: number }>({
    queryKey: ['websites:active', { websiteId }],
    queryFn: async () => {
      return get(`/websites/${websiteId}/active`);
    },
    enabled: !!websiteId,
    refetchInterval: 15000, // poll every 15s
    staleTime: 10000,
  });
}
