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
  const { timezone, toUtc, canonicalizeTimezone } = useTimezone();
  const {
    dateRange: { startDate, endDate, unit },
  } = useDateRange({ timezone });

  const utcStart = toUtc(startDate);
  const utcEnd = toUtc(endDate);
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
