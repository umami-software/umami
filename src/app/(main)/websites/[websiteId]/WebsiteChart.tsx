import { useMemo } from 'react';
import PageviewsChart from 'components/metrics/PageviewsChart';
import { getDateArray } from 'lib/date';
import useWebsitePageviews from 'components/hooks/queries/useWebsitePageviews';
import { useDateRange } from 'components/hooks';

export function WebsiteChart({ websiteId }: { websiteId: string }) {
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate, unit } = dateRange;
  const { data, isLoading } = useWebsitePageviews(websiteId);

  const chartData = useMemo(() => {
    if (data) {
      return {
        pageviews: getDateArray(data.pageviews, startDate, endDate, unit),
        sessions: getDateArray(data.sessions, startDate, endDate, unit),
      };
    }
    return { pageviews: [], sessions: [] };
  }, [data, startDate, endDate, unit]);

  return <PageviewsChart data={chartData} unit={unit} isLoading={isLoading} />;
}

export default WebsiteChart;
