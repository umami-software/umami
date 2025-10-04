import { useDateRange } from './useDateRange';
import { useTimezone } from './useTimezone';

export function useDateParameters() {
  const {
    dateRange: { startDate, endDate, unit },
  } = useDateRange();
  const { timezone, toUtc } = useTimezone();

  return {
    startAt: +toUtc(startDate),
    endAt: +toUtc(endDate),
    startDate: toUtc(startDate).toISOString(),
    endDate: toUtc(endDate).toISOString(),
    unit,
    timezone,
  };
}
