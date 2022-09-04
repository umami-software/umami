import { useCallback, useMemo } from 'react';
import { parseISO } from 'date-fns';
import { getDateRange } from 'lib/date';
import { getItem, setItem } from 'next-basics';
import { DATE_RANGE_CONFIG, DEFAULT_DATE_RANGE } from 'lib/constants';
import useForceUpdate from './useForceUpdate';
import useLocale from './useLocale';
import useStore, { setDateRange } from 'store/websites';

export default function useDateRange(websiteId) {
  const { locale } = useLocale();
  const forceUpdate = useForceUpdate();
  const selector = useCallback(state => state?.[websiteId]?.dateRange, [websiteId]);
  const websiteDateRange = useStore(selector);
  const defaultDateRange = useMemo(() => getDateRange(DEFAULT_DATE_RANGE, locale), [locale]);

  const globalDefault = getItem(DATE_RANGE_CONFIG);
  let globalDateRange;

  if (globalDefault) {
    if (typeof globalDefault === 'string') {
      globalDateRange = getDateRange(globalDefault, locale);
    } else if (typeof globalDefault === 'object') {
      globalDateRange = {
        ...globalDefault,
        startDate: parseISO(globalDefault.startDate),
        endDate: parseISO(globalDefault.endDate),
      };
    }
  }

  function saveDateRange(dateRange) {
    if (websiteId) {
      setDateRange(websiteId, dateRange);
    } else {
      setItem(DATE_RANGE_CONFIG, dateRange);
      forceUpdate();
    }
  }

  return [websiteDateRange || globalDateRange || defaultDateRange, saveDateRange];
}
