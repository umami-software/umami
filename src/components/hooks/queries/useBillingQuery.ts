import { keepPreviousData } from '@tanstack/react-query';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useBillingQuery(billingId?: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`billing:${billingId}`);

  return useQuery({
    queryKey: ['billing', { billingId, modified }],
    queryFn: () => get(`/billing/${billingId}`),
    enabled: !!billingId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
