import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useCommerceCurrenciesQuery,
  useCommerceStatsQuery,
  useDateRange,
  useMessages,
  useTimezone,
} from '@/components/hooks';
import { useWebsiteStatsQuery } from '@/components/hooks/queries/useWebsiteStatsQuery';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { formatLongCurrency, formatLongNumber, formatShortTime } from '@/lib/format';

interface WebsiteMetric {
  label: string;
  value: number;
  prev?: number;
  change: number;
  formatValue: (n: number) => string;
  reverseColors?: boolean;
}

export function WebsiteMetricsBar({
  websiteId,
  compareMode,
}: {
  websiteId: string;
  showChange?: boolean;
  compareMode?: boolean;
}) {
  const { timezone } = useTimezone();
  const { isAllTime, dateCompare, hasComparison } = useDateRange({ timezone });
  const { t, labels, getErrorMessage } = useMessages();
  const { data, isLoading, isFetching, error } = useWebsiteStatsQuery({
    websiteId,
    compare: compareMode ? dateCompare?.compare : undefined,
  });

  const { pageviews, visitors, visits, bounces, totaltime, comparison } = data || {};
  const revenue = useRevenueMetric(websiteId, compareMode ? dateCompare?.compare : undefined);

  const metrics: WebsiteMetric[] | null = data
    ? [
        {
          value: visitors,
          label: t(labels.visitors),
          change: visitors - comparison.visitors,
          formatValue: formatLongNumber,
        },
        {
          value: visits,
          label: t(labels.visits),
          change: visits - comparison.visits,
          formatValue: formatLongNumber,
        },
        {
          value: pageviews,
          label: t(labels.views),
          change: pageviews - comparison.pageviews,
          formatValue: formatLongNumber,
        },
        {
          label: t(labels.bounceRate),
          value: (Math.min(visits, bounces) / visits) * 100,
          prev: (Math.min(comparison.visits, comparison.bounces) / comparison.visits) * 100,
          change:
            (Math.min(visits, bounces) / visits) * 100 -
            (Math.min(comparison.visits, comparison.bounces) / comparison.visits) * 100,
          formatValue: n => `${Math.round(+n)}%`,
          reverseColors: true,
        },
        {
          label: t(labels.visitDuration),
          value: totaltime / visits,
          prev: comparison.totaltime / comparison.visits,
          change: totaltime / visits - comparison.totaltime / comparison.visits,
          formatValue: n =>
            `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`,
        },
        ...(revenue ? [revenue] : []),
      ]
    : null;

  return (
    <LoadingPanel
      data={metrics}
      isLoading={isLoading}
      isFetching={isFetching}
      error={getErrorMessage(error)}
      minHeight="136px"
    >
      <MetricsBar>
        {metrics?.map(({ label, value, prev, change, formatValue, reverseColors }) => {
          return (
            <MetricCard
              key={label}
              value={value}
              previousValue={prev}
              label={label}
              change={change}
              formatValue={formatValue}
              reverseColors={reverseColors}
              showChange={!isAllTime && hasComparison}
            />
          );
        })}
      </MetricsBar>
    </LoadingPanel>
  );
}

/**
 * Revenue from completed orders, in the currency with the most orders, when the website
 * records commerce data in the period. Shares without the Commerce section never see it.
 */
function useRevenueMetric(websiteId: string, compare?: string): WebsiteMetric | null {
  const { t } = useMessages();
  const { data: currencies } = useCommerceCurrenciesQuery(websiteId, { retry: false });
  // Only when the period has completed orders; carts alone do not earn a revenue card.
  const currency = currencies?.[0]?.orders > 0 ? currencies[0].currency : undefined;
  const { data } = useCommerceStatsQuery(
    websiteId,
    { currency, compare },
    { retry: false, enabled: !!currency },
  );

  if (!currency || !data) {
    return null;
  }

  return {
    label: t('commerce.revenue'),
    value: data.revenue,
    prev: data.comparison?.revenue,
    change: data.revenue - (data.comparison?.revenue ?? 0),
    formatValue: (n: number) => formatLongCurrency(n, currency),
    reverseColors: false,
  };
}
