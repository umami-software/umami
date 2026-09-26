import { keepPreviousData } from '@tanstack/react-query';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function usePaymentProviderQuery(paymentProviderId?: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`paymentProvider:${paymentProviderId}`);

  return useQuery({
    queryKey: ['paymentProvider', { paymentProviderId, modified }],
    queryFn: () => get(`/payment-providers/${paymentProviderId}`),
    enabled: !!paymentProviderId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
