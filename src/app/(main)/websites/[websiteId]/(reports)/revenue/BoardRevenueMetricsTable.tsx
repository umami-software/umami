import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useDateRange, useMessages } from '@/components/hooks';
import type { RevenueMetricType } from '@/components/hooks/queries/useRevenueMetricsQuery';
import { useRevenueStatsQuery } from '@/components/hooks/queries/useRevenueStatsQuery';
import { RevenueMetricsTable } from './RevenueMetricsTable';
import { useBoardRevenueCurrency } from './useBoardRevenueCurrency';

function getRevenueTableTitle(type: RevenueMetricType, labels: Record<string, string>, t: (key: string) => string) {
  switch (type) {
    case 'referrer':
      return t(labels.referrer);
    case 'channel':
      return t(labels.channel);
    case 'country':
      return t(labels.country);
    case 'region':
      return t(labels.region);
  }
}

export function BoardRevenueMetricsTable({
  websiteId,
  type = 'referrer',
  currency: selectedCurrency,
}: {
  websiteId: string;
  type?: RevenueMetricType;
  currency?: string;
}) {
  const currency = useBoardRevenueCurrency(selectedCurrency);
  const { compare } = useDateRange();
  const { t, labels } = useMessages();
  const { data, isLoading, isFetching, error } = useRevenueStatsQuery({
    websiteId,
    currency,
    compare,
  });

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
      {data && (
        <RevenueMetricsTable
          websiteId={websiteId}
          currency={currency}
          type={type}
          title={getRevenueTableTitle(type, labels, t)}
          totalRevenue={Number(data.sum) || 0}
          enabled={true}
        />
      )}
    </LoadingPanel>
  );
}
