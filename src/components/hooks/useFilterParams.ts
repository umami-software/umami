import { useNavigation } from './useNavigation';
import { useDateRange } from './useDateRange';
import { useTimezone } from './useTimezone';
import { zonedTimeToUtc } from 'date-fns-tz';

export function useFilterParams(websiteId: string) {
  const { dateRange } = useDateRange(websiteId);
  const { startDate, endDate, unit } = dateRange;
  const { timezone } = useTimezone();
  const {
    query: { url, referrer, title, query, host, os, browser, device, country, region, city, event },
  } = useNavigation();

  return {
    startAt: +zonedTimeToUtc(startDate, timezone),
    endAt: +zonedTimeToUtc(endDate, timezone),
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
