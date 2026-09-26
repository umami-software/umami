import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function usePaymentProvidersQuery(
  params?: Record<string, any>,
  options?: ReactQueryOptions,
) {
  const { get } = useApi();
  const { modified } = useModified('paymentProviders');

  return usePagedQuery({
    queryKey: ['paymentProviders', { modified, ...params }],
    queryFn: pageParams => get('/payment-providers', { ...pageParams, ...params }),
    ...options,
  });
}
