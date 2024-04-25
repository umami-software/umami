import { useDateRange, useNavigation, useTimezone } from 'components/hooks';
import { zonedTimeToUtc } from 'date-fns-tz';
import useApi from './useApi';

export function useWebsiteEvents(websiteId: string, options?: { [key: string]: string }) {
  const { get, useQuery } = useApi();
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate, unit, offset } = dateRange;
  const { timezone } = useTimezone();
  const {
    query: { url, referrer, os, browser, device, country, region, city, title, event },
  } = useNavigation();

  const params = {
    startAt: +zonedTimeToUtc(startDate, timezone),
    endAt: +zonedTimeToUtc(endDate, timezone),
    unit,
    offset,
    url,
    referrer,
    os,
    browser,
    device,
    country,
    region,
    city,
    title,
    timezone,
    event,
  };

  return useQuery({
    queryKey: ['events', { websiteId, ...params }],
    queryFn: () => get(`/websites/${websiteId}/events`, params),
    enabled: !!websiteId,
    ...options,
  });
}

export default useWebsiteEvents;
