import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useDateRange, useMessages, useTimezone } from '@/components/hooks';
import { useWebsiteStatsQuery } from '@/components/hooks/queries/useWebsiteStatsQuery';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { formatLongNumber, formatShortTime } from '@/lib/format';

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
  const { t, labels } = useMessages();
  const { data, isLoading, isFetching, error } = useWebsiteStatsQuery({
    websiteId,
    compare: compareMode ? dateCompare?.compare : undefined,
  });

  const { pageviews, visitors, visits, bounces, totaltime, comparison } = data || {};

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
      ]
    : null;

  const isPending = isLoading || isFetching;

  if (error && !isPending) {
    return <ErrorMessage />;
  }

  if (!isPending && !metrics) {
    return null;
  }

  // While loading, show the same cards with placeholders so the bar keeps its size.
  const cards: Partial<WebsiteMetric>[] =
    !isPending && metrics
      ? metrics
      : [
          t(labels.visitors),
          t(labels.visits),
          t(labels.views),
          t(labels.bounceRate),
          t(labels.visitDuration),
        ].map(label => ({ label }));

  return (
    <MetricsBar aria-busy={isPending}>
      {cards.map(({ label, value, prev, change, formatValue, reverseColors }) => {
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
            loading={isPending}
          />
        );
      })}
    </MetricsBar>
  );
}
