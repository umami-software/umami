import { toZonedTime } from 'date-fns-tz';
import { useMemo } from 'react';
import { useLocale } from '@/components/hooks/useLocale';
import { useNavigation } from '@/components/hooks/useNavigation';
import { DATE_RANGE_CONFIG, DEFAULT_DATE_RANGE_VALUE } from '@/lib/constants';
import { getCompareDate, getOffsetDateRange, parseDateRange } from '@/lib/date';
import { getItem } from '@/lib/storage';

export function useDateRange(options: { ignoreOffset?: boolean; timezone?: string } = {}) {
  const {
    query: { date = '', unit = '', offset = 0, compare = 'prev' },
  } = useNavigation();
  const { locale } = useLocale();
  const dateRange = useMemo(() => {
    const dateRangeObject = parseDateRange(
      date || getItem(DATE_RANGE_CONFIG) || DEFAULT_DATE_RANGE_VALUE,
      unit,
      locale,
      options.timezone,
    );

    return !options.ignoreOffset && offset
      ? getOffsetDateRange(dateRangeObject, +offset)
      : dateRangeObject;
  }, [date, unit, offset, options]);

  const now = new Date();
  const dateCompare = getCompareDate(
    compare,
    dateRange.startDate,
    dateRange.endDate,
    options.timezone ? toZonedTime(now, options.timezone) : now,
  );
  // In the first hour of a period no whole hour has elapsed, so the comparison window is empty.
  const hasComparison = !(dateCompare.endDate < dateCompare.startDate);

  return {
    date,
    unit,
    offset,
    compare,
    isAllTime: date.endsWith(`:all`),
    isCustomRange: date.startsWith('range:'),
    dateRange,
    dateCompare,
    hasComparison,
  };
}
