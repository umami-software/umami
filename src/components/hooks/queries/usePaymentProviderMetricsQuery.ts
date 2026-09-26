import { keepPreviousData } from '@tanstack/react-query';
import { startOfMonth, subMonths } from 'date-fns';
import { useMemo } from 'react';
import type { ReactQueryOptions } from '@/lib/types';
import type { ARRMetrics } from '@/queries/sql/paymentProvider/getARR';
import { useApi } from '../useApi';

// Defaults to the last 36 months (current month + 35 prior), from the start of that first month.
// Only the most recent DISPLAY_MONTHS (see arr.ts) get charted — the extra trailing year is
// fetched purely so every displayed month has a same-month comparator for year-over-year growth.
export function usePaymentProviderMetricsQuery(
  paymentProviderId?: string,
  options?: ReactQueryOptions<ARRMetrics[]>,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt } = useMemo(() => {
    const now = new Date();
    return { startAt: +startOfMonth(subMonths(now, 35)), endAt: +now };
  }, []);

  return useQuery<ARRMetrics[]>({
    queryKey: ['paymentProvider:metrics', { paymentProviderId, startAt, endAt }],
    queryFn: () => get(`/payment-providers/${paymentProviderId}/metrics`, { startAt, endAt }),
    enabled: !!paymentProviderId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
