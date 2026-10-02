import { type CommerceStatsData, useDateRange, useMessages, useTimezone } from '@/components/hooks';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { formatLongNumber } from '@/lib/format';
import { currencyFormatter, formatDecimal, formatPercent } from './commerceUtils';

export interface CommerceMetricsBarProps {
  data: CommerceStatsData;
  currency: string;
  /** `product` shows line revenue and units of the selected product instead of order totals. */
  variant?: 'overview' | 'product';
}

interface Metric {
  key: string;
  label: string;
  value: number;
  previous: number;
  formatValue: (n: number) => string;
}

export function CommerceMetricsBar({
  data,
  currency,
  variant = 'overview',
}: CommerceMetricsBarProps) {
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
    formatValue,
  });

  const metrics: Metric[] =
    variant === 'product'
      ? [
          metric('revenue', t('commerce.revenue'), money),
          metric('units', t('commerce.units'), formatLongNumber),
          metric('orders', t('commerce.orders'), formatLongNumber),
          metric('buyers', t('commerce.buyers'), formatLongNumber),
          metric('averageOrderValue', t('commerce.averageOrderValue'), money),
        ]
      : [
          metric('revenue', t('commerce.revenue'), money),
          metric('orders', t('commerce.orders'), formatLongNumber),
          metric('averageOrderValue', t('commerce.averageOrderValue'), money),
          metric('buyers', t('commerce.buyers'), formatLongNumber),
          metric('conversionRate', t('commerce.conversionRate'), formatPercent),
          metric('revenuePerVisitor', t('commerce.revenuePerVisitor'), money),
          metric('unitsPerOrder', t('commerce.unitsPerOrder'), formatDecimal),
        ];

  return (
    <MetricsBar>
      {metrics.map(({ key, label, value, previous, formatValue }) => (
        <MetricCard
          key={key}
          label={label}
          value={value}
          change={value - previous}
          formatValue={formatValue}
          showChange={!isAllTime && hasComparison && !!comparison}
        />
      ))}
    </MetricsBar>
  );
}
