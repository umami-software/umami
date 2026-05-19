import { useMemo } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useDateRange, useMessages, useNavigation, useTimezone } from '@/components/hooks';
import { useWebsitePageviewsQuery } from '@/components/hooks/queries/useWebsitePageviewsQuery';
import { MetricSeriesChart, type MetricSeriesKind } from '@/components/metrics/MetricSeriesChart';
import { PageviewsChart } from '@/components/metrics/PageviewsChart';

export type WebsiteChartMetric = 'pageviews' | MetricSeriesKind;

export const DEFAULT_WEBSITE_CHART_METRIC: WebsiteChartMetric = 'pageviews';

export function WebsiteChart({
  websiteId,
  compareMode,
}: {
  websiteId: string;
  compareMode?: boolean;
}) {
  const { query } = useNavigation();
  const metric = (query.metric as WebsiteChartMetric) ?? DEFAULT_WEBSITE_CHART_METRIC;
  const { timezone } = useTimezone();
  const { dateRange, dateCompare } = useDateRange({ timezone: timezone });
  const { startDate, endDate, unit, value } = dateRange;
  const { t, labels } = useMessages();
  const { data, isLoading, isFetching, error } = useWebsitePageviewsQuery({
    websiteId,
    compare: compareMode ? dateCompare?.compare : undefined,
    // Only ask the server for the session-series metrics when they are
    // actually selected; otherwise the server skips the third DB query.
    metric: metric === 'pageviews' ? undefined : metric,
  });
  const { pageviews, sessions, bouncerate, visitduration, compare } = (data || {}) as any;

  const pageviewsChartData = useMemo(() => {
    if (!data) {
      return { pageviews: [], sessions: [] };
    }

    return {
      pageviews,
      sessions,
      ...(compare && {
        compare: {
          pageviews: pageviews.map(({ x }, i) => ({
            x,
            y: compare.pageviews[i]?.y,
            d: compare.pageviews[i]?.x,
          })),
          sessions: sessions.map(({ x }, i) => ({
            x,
            y: compare.sessions[i]?.y,
            d: compare.sessions[i]?.x,
          })),
        },
      }),
    };
  }, [data, startDate, endDate, unit]);

  const metricChartData = useMemo(() => {
    if (!data || metric === 'pageviews') return null;

    const series = metric === 'bouncerate' ? bouncerate : visitduration;
    const compareSeries = compare
      ? metric === 'bouncerate'
        ? compare.bouncerate
        : compare.visitduration
      : null;

    return {
      series: series ?? [],
      ...(compareSeries && {
        compare: series.map(({ x }, i) => ({
          x,
          y: compareSeries[i]?.y ?? 0,
          d: compareSeries[i]?.x,
        })),
      }),
    };
  }, [data, metric, bouncerate, visitduration, compare]);

  return (
    <LoadingPanel data={data} isFetching={isFetching} isLoading={isLoading} error={error}>
      {metric === 'pageviews' ? (
        <PageviewsChart
          key={`${value}-pageviews`}
          data={pageviewsChartData}
          minDate={startDate}
          maxDate={endDate}
          unit={unit}
        />
      ) : (
        <MetricSeriesChart
          key={`${value}-${metric}`}
          data={metricChartData}
          minDate={startDate}
          maxDate={endDate}
          unit={unit}
          kind={metric}
          label={metric === 'bouncerate' ? t(labels.bounceRate) : t(labels.visitDuration)}
          comparePreviousLabel={`${
            metric === 'bouncerate' ? t(labels.bounceRate) : t(labels.visitDuration)
          } (${t(labels.previous)})`}
        />
      )}
    </LoadingPanel>
  );
}
