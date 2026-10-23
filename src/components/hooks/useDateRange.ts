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
    // Fall back to the default range when the URL or stored value can't be parsed.
    const dateRangeObject =
      parseDateRange(
        date || getItem(DATE_RANGE_CONFIG) || DEFAULT_DATE_RANGE_VALUE,
        unit,
        locale,
        options.timezone,
      ) ?? parseDateRange(DEFAULT_DATE_RANGE_VALUE, unit, locale, options.timezone);

    return !options.ignoreOffset && offset
      ? getOffsetDateRange(dateRangeObject, +offset)
      : dateRangeObject;
  }, [date, unit, offset, options]);

  const dateCompare = getCompareDate(compare, dateRange.startDate, dateRange.endDate);
  // False when an invalid date was replaced by the default range.
  const isValidDate = dateRange.value === date;

  return {
    date,
    unit,
    offset,
    compare,
    isAllTime: isValidDate && date.endsWith(`:all`),
    isCustomRange: isValidDate && date.startsWith('range:'),
    dateRange,
    dateCompare,
  };
}
