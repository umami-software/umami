import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useDateRange } from '@/components/hooks';
import { useRevenueStatsQuery } from '@/components/hooks/queries/useRevenueStatsQuery';
import { RevenueMetricsBar } from './RevenueMetricsBar';
import { useBoardRevenueCurrency } from './useBoardRevenueCurrency';

export function BoardRevenueMetricsBar({
  websiteId,
  currency: selectedCurrency,
}: {
  websiteId: string;
  currency?: string;
}) {
  const currency = useBoardRevenueCurrency(selectedCurrency);
  const { compare } = useDateRange();
  const { data, isLoading, isFetching, error } = useRevenueStatsQuery({
    websiteId,
    currency,
    compare,
  });

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
      {data && <RevenueMetricsBar data={data} currency={currency} />}
    </LoadingPanel>
  );
}
