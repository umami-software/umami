import { useDateRange } from './useDateRange';
import { useTimezone } from './useTimezone';

export function useDateParameters() {
  const {
    dateRange: { startDate, endDate, unit },
  } = useDateRange();
  const { timezone, localToUtc, canonicalizeTimezone } = useTimezone();

  const startAtValue = +localToUtc(startDate);
  const endAtValue = +localToUtc(endDate);

  return {
    startAt: Number.isFinite(startAtValue) ? startAtValue : +startDate,
    endAt: Number.isFinite(endAtValue) ? endAtValue : +endDate,
    startDate: localToUtc(startDate).toISOString(),
    endDate: localToUtc(endDate).toISOString(),
    unit,
    timezone: canonicalizeTimezone(timezone),
  };
}
