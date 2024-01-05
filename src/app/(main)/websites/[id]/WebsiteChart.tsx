import { useMemo } from 'react';
import PageviewsChart from 'components/metrics/PageviewsChart';
import { useApi, useDateRange, useTimezone, useNavigation } from 'components/hooks';
import { getDateArray } from 'lib/date';

export function WebsiteChart({ websiteId }: { websiteId: string }) {
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate, unit, modified } = dateRange;
  const [timezone] = useTimezone();
  const {
    query: { url, referrer, os, browser, device, country, region, city, title },
  } = useNavigation();
  const { get, useQuery } = useApi();

  const { data, isLoading } = useQuery({
    queryKey: [
      'websites:pageviews',
      { websiteId, modified, url, referrer, os, browser, device, country, region, city, title },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/pageviews`, {
        startAt: +startDate,
        endAt: +endDate,
        unit,
        timezone,
        url,
        referrer,
        os,
        browser,
        device,
        country,
        region,
        city,
        title,
      }),
  });

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
