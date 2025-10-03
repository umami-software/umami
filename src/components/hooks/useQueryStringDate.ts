import { useNavigation } from '@/components/hooks/useNavigation';
import { useMemo } from 'react';
import { getCompareDate, getOffsetDateRange, parseDateRange } from '@/lib/date';
import { useLocale } from '@/components/hooks/useLocale';
import { DEFAULT_DATE_RANGE_VALUE } from '@/lib/constants';

export function useQueryStringDate(options: { ignoreOffset?: boolean } = {}) {
  const {
    query: { date = DEFAULT_DATE_RANGE_VALUE, offset = 0, compare = 'prev' },
  } = useNavigation();
  const { locale } = useLocale();

  const dateRange = useMemo(() => {
    const dateRangeObject = parseDateRange(date, locale);

    return !options.ignoreOffset && offset
      ? getOffsetDateRange(dateRangeObject, +offset)
      : dateRangeObject;
  }, [date, offset, options]);

  const dateCompare = getCompareDate(compare, dateRange.startDate, dateRange.endDate);

  return { date, offset, dateRange, dateCompare };
}
