import { keepPreviousData } from '@tanstack/react-query';
import { startOfMonth, subMonths } from 'date-fns';
import { useMemo } from 'react';
import type { MonthlyARR } from '@/lib/stripe';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';

// Defaults to the last 3 months (current month + 2 prior), from the start of that first month.
export function useBillingMetricsQuery(
  billingId?: string,
  options?: ReactQueryOptions<MonthlyARR[]>,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt } = useMemo(() => {
    const now = new Date();
    return { startAt: +startOfMonth(subMonths(now, 2)), endAt: +now };
  }, []);

  return useQuery<MonthlyARR[]>({
    queryKey: ['billing:metrics', { billingId, startAt, endAt }],
    queryFn: () => get(`/billing/${billingId}/metrics`, { startAt, endAt }),
    enabled: !!billingId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
