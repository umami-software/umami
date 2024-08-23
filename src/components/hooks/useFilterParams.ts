import { useNavigation } from './useNavigation';
import { useDateRange } from './useDateRange';
import { useTimezone } from './useTimezone';

export function useFilterParams(websiteId: string) {
  const { dateRange } = useDateRange(websiteId);
  const { startDate, endDate, unit } = dateRange;
  const { timezone, toUtc } = useTimezone();
  const {
    query: { url, referrer, title, query, host, os, browser, device, country, region, city, event },
  } = useNavigation();

  return {
    startAt: +toUtc(startDate),
    endAt: +toUtc(endDate),
    unit,
    timezone,
    url,
    referrer,
    title,
    query,
    host,
    os,
    browser,
    device,
    country,
    region,
    city,
    event,
  };
}
