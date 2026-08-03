'use client';
import { useBillingMetricsQuery, useBillingQuery } from '@/components/hooks';

export function BillingsPage({ billingId }: { billingId: string }) {
  const { data } = useBillingQuery(billingId);
  const { data: metrics } = useBillingMetricsQuery(billingId);

  return <pre>{JSON.stringify({ ...data, metrics }, null, 2)}</pre>;
}
