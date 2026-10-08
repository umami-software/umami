import { type CommerceStatsData, useDateRange, useMessages, useTimezone } from '@/components/hooks';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { formatLongNumber } from '@/lib/format';
import { currencyFormatter, formatPercent } from './commerceUtils';

export interface CommerceMetricsBarProps {
  data: CommerceStatsData;
  currency: string;
}

interface Metric {
  key: string;
  label: string;
  value: number;
  previous: number;
  formatValue: (n: number) => string;
  available?: boolean;
}

export function CommerceMetricsBar({ data, currency }: CommerceMetricsBarProps) {
  const { t } = useMessages();
  const { timezone } = useTimezone();
  const { isAllTime, hasComparison } = useDateRange({ timezone });
  const money = currencyFormatter(currency);
  const comparison = data.comparison;

  const metric = (
    key: keyof Omit<CommerceStatsData, 'comparison'>,
    label: string,
    formatValue: (n: number) => string,
  ): Metric => ({
    key,
    label,
    value: Number(data[key]) || 0,
    previous: Number(comparison?.[key]) || 0,
    available: data[key] !== null,
    formatValue: data[key] === null ? () => '—' : formatValue,
  });

  const metrics: Metric[] = [
    metric('revenue', t('commerce.revenue'), money),
    metric('refundAmount', t('commerce.refundAmount'), money),
    metric('netRevenue', t('commerce.netRevenue'), money),
    metric('orders', t('commerce.orders'), formatLongNumber),
    metric('averageOrderValue', t('commerce.averageOrderValue'), money),
    metric('buyers', t('commerce.buyers'), formatLongNumber),
    metric('conversionRate', t('commerce.conversionRate'), formatPercent),
    metric('revenuePerVisitor', t('commerce.revenuePerVisitor'), money),
  ];

  return (
    <MetricsBar>
      {metrics.map(({ key, label, value, previous, formatValue, available }) => (
        <MetricCard
          key={key}
          label={label}
          value={value}
          change={value - previous}
          formatValue={formatValue}
          tooltip={available === false ? t('commerce.unavailableMarketConversion') : undefined}
          showChange={
            available !== false && !isAllTime && hasComparison && comparison?.[key] != null
          }
        />
      ))}
    </MetricsBar>
  );
}
