import { useApi } from '../useApi';

export function useActiveVisitorsQuery(
  websiteId: string,
  options?: Omit<
    import('@tanstack/react-query').UseQueryOptions<{ visitors: number }>,
    'queryKey' | 'queryFn'
  >,
) {
  const { get, useQuery } = useApi();

  return useQuery<{ visitors: number }>({
    queryKey: ['websites:active', { websiteId }],
    queryFn: () => get(`/websites/${websiteId}/active`),
    refetchInterval: 15000, // poll every 15s
    staleTime: 10000,
    ...options,
    enabled: !!websiteId && (options?.enabled ?? true),
  });
}
