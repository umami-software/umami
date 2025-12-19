import { useDateRange } from './useDateRange';
import { useTimezone } from './useTimezone';

export function useDateParameters() {
  const {
    dateRange: { startDate, endDate, unit },
  } = useDateRange();
  const { timezone, localToUtc, canonicalizeTimezone } = useTimezone();

  return {
    startAt: +localToUtc(startDate),
    endAt: +localToUtc(endDate),
    startDate: localToUtc(startDate).toISOString(),
    endDate: localToUtc(endDate).toISOString(),
    unit,
    timezone: canonicalizeTimezone(timezone),
  };
}
