import { useNavigation } from './useNavigation';
import { useDateRange } from './useDateRange';
import { useTimezone } from './useTimezone';

export function useFilterParams(websiteId: string) {
  const { dateRange } = useDateRange(websiteId);
  const { startDate, endDate, unit } = dateRange;
  const { timezone, toUtc } = useTimezone();
  const {
    query: {
      path,
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
      tag,
      hostname,
      page,
      pageSize,
      search,
    },
  } = useNavigation();

  return {
    // Date range
    startAt: +toUtc(startDate),
    endAt: +toUtc(endDate),
    unit,
    timezone,
    // Filters
    path,
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
    tag,
    hostname,
    // Paging
    page,
    pageSize,
    search,
  };
}
