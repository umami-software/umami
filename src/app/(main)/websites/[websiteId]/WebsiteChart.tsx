import { useMemo } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { PageviewsChart } from '@/components/metrics/PageviewsChart';
import { useWebsitePageviewsQuery } from '@/components/hooks/queries/useWebsitePageviewsQuery';
import { useDateRange } from '@/components/hooks';

export function WebsiteChart({
  websiteId,
  compareMode = false,
}: {
  websiteId: string;
  compareMode?: boolean;
}) {
  const { dateRange, dateCompare } = useDateRange(websiteId);
  const { startDate, endDate, unit, value } = dateRange;
  const { data, isLoading, error } = useWebsitePageviewsQuery(
    websiteId,
    compareMode ? dateCompare : undefined,
  );
  const { pageviews, sessions, compare } = (data || {}) as any;

  const chartData = useMemo(() => {
    if (data) {
      const result = {
        pageviews,
        sessions,
      };

      if (compare) {
        result['compare'] = {
          pageviews: result.pageviews.map(({ x }, i) => ({
            x,
            y: compare.pageviews[i]?.y,
            d: compare.pageviews[i]?.x,
          })),
          sessions: result.sessions.map(({ x }, i) => ({
            x,
            y: compare.sessions[i]?.y,
            d: compare.sessions[i]?.x,
          })),
        };
      }

      return result;
    }
    return { pageviews: [], sessions: [] };
  }, [data, startDate, endDate, unit]);

  return (
    <LoadingPanel isLoading={isLoading} error={error}>
      <PageviewsChart
        key={value}
        data={chartData}
        minDate={value === 'all' ? undefined : startDate}
        maxDate={endDate}
        unit={unit}
      />
    </LoadingPanel>
  );
}
