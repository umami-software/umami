import type { ReactNode } from 'react';
import { useDateRange, useMessages } from '@/components/hooks';
import type { RevenueStatsData } from '@/components/hooks/queries/useRevenueStatsQuery';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { formatLongCurrency, formatLongNumber } from '@/lib/format';

export interface RevenueMetricsBarProps {
  data: RevenueStatsData;
  currency: string;
}

interface RevenueMetricItem {
  value: number;
  label: string;
  change: number;
  formatValue: (n: number) => string;
  tooltip?: ReactNode;
}

export function RevenueMetricsBar({ data, currency }: RevenueMetricsBarProps) {
  const { t, labels } = useMessages();
  const { isAllTime } = useDateRange();
  const { sum, count, average, unique_count, arpu, comparison } = data;

  const metrics: RevenueMetricItem[] = [
    {
      value: sum,
      label: t(labels.total),
      change: comparison ? sum - comparison.sum : 0,
      formatValue: (n: number) => formatLongCurrency(n, currency),
    },
    {
      value: average,
      label: t(labels.aov),
      tooltip: (
        <>
          <div>Average Order Value</div>
          <div>(Total Revenue / Orders)</div>
        </>
      ),
      change: comparison ? average - comparison.average : 0,
      formatValue: (n: number) => formatLongCurrency(n, currency),
    },
    {
      value: arpu,
      label: t(labels.arpu),
      tooltip: (
        <>
          <div>Average Revenue Per User</div>
          <div>(Total Revenue / All Sessions)</div>
        </>
      ),
      change: comparison ? arpu - (comparison.arpu ?? 0) : 0,
      formatValue: (n: number) => formatLongCurrency(n, currency),
    },
    {
      value: count,
      label: t(labels.orders),
      change: comparison ? count - comparison.count : 0,
      formatValue: formatLongNumber,
    },
    {
      value: unique_count,
      label: t(labels.uniqueCustomers),
      change: comparison ? unique_count - comparison.unique_count : 0,
      formatValue: formatLongNumber,
    },
  ];

  return (
    <MetricsBar>
      {metrics.map(({ label, value, change, formatValue, tooltip }) => {
        return (
          <MetricCard
            key={label}
            value={value}
            label={label}
            tooltip={tooltip}
            change={change}
            formatValue={formatValue}
            showChange={!isAllTime}
          />
        );
      })}
    </MetricsBar>
  );
}
