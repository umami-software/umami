import { useNavigation } from '@/components/hooks/useNavigation';
import { useMemo } from 'react';
import { getCompareDate, getOffsetDateRange, parseDateRange } from '@/lib/date';
import { useLocale } from '@/components/hooks/useLocale';
import { DATE_RANGE_CONFIG, DEFAULT_DATE_RANGE_VALUE } from '@/lib/constants';
import { getItem } from '@/lib/storage';

export function useDateRange(options: { ignoreOffset?: boolean; timezone?: string } = {}) {
  const {
    query: { date = '', offset = 0, compare = 'prev' },
  } = useNavigation();
  const { locale } = useLocale();

  const dateRange = useMemo(() => {
    const dateRangeObject = parseDateRange(
      date || getItem(DATE_RANGE_CONFIG) || DEFAULT_DATE_RANGE_VALUE,
      locale,
      options.timezone,
    );

    return !options.ignoreOffset && offset
      ? getOffsetDateRange(dateRangeObject, +offset)
      : dateRangeObject;
  }, [date, offset, options]);

  const dateCompare = getCompareDate(compare, dateRange.startDate, dateRange.endDate);

  return {
    date,
    offset,
    compare,
    isAllTime: date.endsWith(`:all`),
    isCustomRange: date.startsWith('range:'),
    dateRange,
    dateCompare,
  };
}
