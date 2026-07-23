import { Grid } from '@umami/react-zen';
import { useMemo } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { type RevenueMetricType, useMessages, useRevenueMetricsQuery } from '@/components/hooks';
import { ListTable } from '@/components/metrics/ListTable';
import { MetricLabel } from '@/components/metrics/MetricLabel';
import { formatLongCurrency } from '@/lib/format';

const MAX_ROWS = 10;

export interface RevenueMetricsTableProps {
  websiteId: string;
  currency: string;
  type: RevenueMetricType;
  title: string;
  totalRevenue: number;
  enabled: boolean;
}

export function RevenueMetricsTable({
  websiteId,
  currency,
  type,
  title,
  totalRevenue,
  enabled,
}: RevenueMetricsTableProps) {
  const { t, labels } = useMessages();
  const { data, isLoading, isFetching, error } = useRevenueMetricsQuery(
    websiteId,
    { type, currency },
    { enabled },
  );

  const tableData = useMemo(
    () =>
      data
        ?.map(({ name, value, country }) => ({
          label: name,
          country,
          count: Number(value),
          percent: totalRevenue > 0 ? (value / totalRevenue) * 100 : 0,
        }))
        .slice(0, MAX_ROWS) || [],
    [data, totalRevenue],
  );

  return (
    <LoadingPanel
      data={data}
      isFetching={isFetching}
      isLoading={isLoading}
      error={error}
      minHeight="400px"
    >
      <Grid padding="2">
        {data && (
          <ListTable
            title={title}
            metric={t(labels.revenue)}
            data={tableData}
            formatCount={(n: number) => formatLongCurrency(n, currency)}
            renderLabel={(row: any) => <MetricLabel type={type} data={row} />}
          />
        )}
      </Grid>
    </LoadingPanel>
  );
}
