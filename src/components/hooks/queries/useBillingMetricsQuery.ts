import { keepPreviousData } from '@tanstack/react-query';
import { startOfMonth, subMonths } from 'date-fns';
import { useMemo } from 'react';
import type { ReactQueryOptions } from '@/lib/types';
import type { ARRMetrics } from '@/queries/sql/billing/getARR';
import { useApi } from '../useApi';

// Defaults to the last 24 months (current month + 23 prior), from the start of that first month.
// The extra trailing year is fetched so the most recent 12 months have a same-month comparator
// available for year-over-year growth, even though only the whole range gets charted.
export function useBillingMetricsQuery(
  billingId?: string,
  options?: ReactQueryOptions<ARRMetrics[]>,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt } = useMemo(() => {
    const now = new Date();
    return { startAt: +startOfMonth(subMonths(now, 23)), endAt: +now };
  }, []);

  return useQuery<ARRMetrics[]>({
    queryKey: ['billing:metrics', { billingId, startAt, endAt }],
    queryFn: () => get(`/billing/${billingId}/metrics`, { startAt, endAt }),
    enabled: !!billingId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
