import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useDateRange, useTimezone } from '@/components/hooks';
import { useRevenueChartQuery } from '@/components/hooks/queries/useRevenueChartQuery';
import { RevenueChart } from './RevenueChart';
import { useBoardRevenueCurrency } from './useBoardRevenueCurrency';

export function BoardRevenueChart({
  websiteId,
  currency: selectedCurrency,
}: {
  websiteId: string;
  currency?: string;
}) {
  const currency = useBoardRevenueCurrency(selectedCurrency);
  const { timezone } = useTimezone();
  const {
    dateRange: { startDate, endDate, unit },
  } = useDateRange({ timezone });
  const { data, isLoading, isFetching, error } = useRevenueChartQuery(websiteId, currency);

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
      {data && (
        <RevenueChart
          data={data.chart}
          unit={unit}
          minDate={startDate}
          maxDate={endDate}
          currency={currency}
        />
      )}
    </LoadingPanel>
  );
}
