import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function useBillingProvidersQuery(
  params?: Record<string, any>,
  options?: ReactQueryOptions,
) {
  const { get } = useApi();
  const { modified } = useModified('billingProviders');

  return usePagedQuery({
    queryKey: ['billingProviders', { modified, ...params }],
    queryFn: pageParams => get('/billing/providers', { ...pageParams, ...params }),
    ...options,
  });
}
