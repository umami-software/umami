import { useDateRange } from './useDateRange';
import { useTimezone } from './useTimezone';

function safeToISOString(date: Date, fallback: Date): string {
  try {
    return date.toISOString();
  } catch {
    return fallback.toISOString();
  }
}

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
    startDate: safeToISOString(isStartValid ? utcStart : startDate, startDate),
    endDate: safeToISOString(isEndValid ? utcEnd : endDate, endDate),
    unit,
    timezone: canonicalizeTimezone(timezone),
  };
}
