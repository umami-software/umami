import { useApi, useDateRange, useNavigation } from 'components/hooks';

export function useWebsiteStats(websiteId: string, options?: { [key: string]: string }) {
  const { get, useQuery } = useApi();
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate } = dateRange;
  const {
    query: { url, referrer, title, os, browser, device, country, region, city },
  } = useNavigation();

  const params = {
    startAt: +startDate,
    endAt: +endDate,
    url,
    referrer,
    title,
    os,
    browser,
    device,
    country,
    region,
    city,
  };

  return useQuery({
    queryKey: ['websites:stats', { websiteId, ...params }],
    queryFn: () => get(`/websites/${websiteId}/stats`, params),
    ...options,
  });
}

export default useWebsiteStats;
