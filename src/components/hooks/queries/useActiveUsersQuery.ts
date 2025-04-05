import { useApi } from '../useApi';
import { UseQueryOptions } from '@tanstack/react-query';

export function useActyiveUsersQuery(
  websiteId: string,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
  const { get, useQuery } = useApi();
  return useQuery<any>({
    queryKey: ['websites:active', websiteId],
    queryFn: () => get(`/websites/${websiteId}/active`),
    enabled: !!websiteId,
    ...options,
  });
}
