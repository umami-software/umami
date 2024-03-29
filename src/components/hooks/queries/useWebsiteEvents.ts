import useApi from './useApi';
import { UseQueryOptions } from '@tanstack/react-query';
import { useDateRange, useNavigation, useTimezone } from 'components/hooks';
import { zonedTimeToUtc } from 'date-fns-tz';

export function useWebsiteEvents(
  websiteId: string,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
  const { get, useQuery } = useApi();
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate, unit, offset } = dateRange;
  const { timezone } = useTimezone();
  const {
    query: { url, event },
  } = useNavigation();

  const params = {
    startAt: +zonedTimeToUtc(startDate, timezone),
    endAt: +zonedTimeToUtc(endDate, timezone),
    unit,
    offset,
    timezone,
    url,
    event,
  };

  return useQuery({
    queryKey: ['events', { ...params }],
    queryFn: () => get(`/websites/${websiteId}/events`, { ...params }),
    enabled: !!websiteId,
    ...options,
  });
}

export default useWebsiteEvents;
