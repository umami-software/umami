import { useDateRange } from 'components/hooks';
import useWebsitePageviews from 'components/hooks/queries/useWebsitePageviews';
import useTimeUnit from 'components/hooks/useTimeUnit';
import PageviewsChart from 'components/metrics/PageviewsChart';
import { useMemo } from 'react';

export function WebsiteChart({
  websiteId,
  compareMode = false,
}: {
  websiteId: string;
  compareMode?: boolean;
}) {
  const { dateRange, dateCompare } = useDateRange(websiteId);
  const { timeUnit } = useTimeUnit();
  const { startDate, endDate } = dateRange;
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
  }, [data, startDate, endDate, timeUnit]);

  return (
    <PageviewsChart
      data={chartData}
      minDate={startDate.toISOString()}
      maxDate={endDate.toISOString()}
      unit={timeUnit}
      isLoading={isLoading}
    />
  );
}

export default WebsiteChart;
