'use client';
import { Column, Heading } from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { usePaymentProviderMetricsQuery, usePaymentProviderQuery } from '@/components/hooks';
import { ARRChart } from './ARRChart';
import { ARRRollForwardTable } from './ARRRollForwardTable';
import { ARRSummaryStats } from './ARRSummaryStats';

export function PaymentProviderPage({ paymentProviderId }: { paymentProviderId: string }) {
  const { data } = usePaymentProviderQuery(paymentProviderId);
  const {
    data: metrics,
    isLoading,
    isFetching,
    error,
  } = usePaymentProviderMetricsQuery(paymentProviderId);

  return (
    <PageBody>
      <Column margin="2" gap>
        <PageHeader title={data?.name || 'Payment Provider'} />
        <Panel gap="6">
          <Heading size="2xl">Revenue Growth</Heading>
          <LoadingPanel data={metrics} isLoading={isLoading} isFetching={isFetching} error={error}>
            {metrics && (
              <Column gap="6">
                <ARRSummaryStats data={metrics} />
                <ARRChart data={metrics} />
              </Column>
            )}
          </LoadingPanel>
        </Panel>
        <Panel gap="6">
          <Heading size="2xl">ARR Roll Forward</Heading>
          <LoadingPanel data={metrics} isLoading={isLoading} isFetching={isFetching} error={error}>
            {metrics && <ARRRollForwardTable data={metrics} />}
          </LoadingPanel>
        </Panel>
      </Column>
    </PageBody>
  );
}
