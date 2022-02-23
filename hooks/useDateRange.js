import { useCallback } from 'react';
import { parseISO } from 'date-fns';
import { getDateRange } from 'lib/date';
import { getItem, setItem } from 'lib/web';
import { DATE_RANGE_CONFIG, DEFAULT_DATE_RANGE } from 'lib/constants';
import useForceUpdate from './useForceUpdate';
import useLocale from './useLocale';
import useStore, { setDateRange } from 'store/websites';

export default function useDateRange(websiteId, defaultDateRange = DEFAULT_DATE_RANGE) {
  const { locale } = useLocale();
  const selector = useCallback(state => state?.[websiteId]?.dateRange, [websiteId]);
  const dateRange = useStore(selector);
  const forceUpdate = useForceUpdate();

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
      const { value } = dateRange;
      setItem(DATE_RANGE_CONFIG, value === 'custom' ? dateRange : value);
      forceUpdate();
    }
  }

  return [dateRange || globalDateRange || getDateRange(defaultDateRange, locale), saveDateRange];
}
