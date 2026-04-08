import { useDateRange } from './useDateRange';
import { useTimezone } from './useTimezone';

export function useDateParameters() {
  const {
    dateRange: { startDate, endDate, unit },
  } = useDateRange();
  const { timezone, localToUtc, canonicalizeTimezone } = useTimezone();

  const utcStart = localToUtc(startDate);
  const utcEnd = localToUtc(endDate);
  const startAtValue = +utcStart;
  const endAtValue = +utcEnd;
  const isStartValid = Number.isFinite(startAtValue);
  const isEndValid = Number.isFinite(endAtValue);

  return {
    startAt: isStartValid ? startAtValue : +startDate,
    endAt: isEndValid ? endAtValue : +endDate,
    startDate: isStartValid ? utcStart.toISOString() : startDate.toISOString(),
    endDate: isEndValid ? utcEnd.toISOString() : endDate.toISOString(),
    unit,
    timezone: canonicalizeTimezone(timezone),
  };
}
