import { useMemo } from 'react';
import PageviewsChart from '@/components/metrics/PageviewsChart';
import useWebsitePageviews from '@/components/hooks/queries/useWebsitePageviews';
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
  const { data, isLoading } = useWebsitePageviews(websiteId, compareMode ? dateCompare : undefined);
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
    <PageviewsChart
      data={chartData}
      minDate={startDate.toISOString()}
      maxDate={endDate.toISOString()}
      unit={unit}
      isLoading={isLoading}
      isAllTime={value === 'all'}
    />
  );
}

export default WebsiteChart;
