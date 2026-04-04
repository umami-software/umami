import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';

export function useActyiveUsersQuery(websiteId: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  return useQuery<any>({
    queryKey: ['websites:active', websiteId],
    queryFn: () => get(`/websites/${websiteId}/active`),
    enabled: !!websiteId,
    ...options,
  });
}
