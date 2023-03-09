import { parseISO } from 'date-fns';
import { parseDateRange } from 'lib/date';
import { setItem } from 'next-basics';
import { DATE_RANGE_CONFIG, DEFAULT_DATE_RANGE } from 'lib/constants';
import useLocale from './useLocale';
import { getWebsiteDateRange, setWebsiteDateRange } from 'store/websites';
import useStore, { setDateRange } from 'store/app';

function parseValue(value, locale) {
  if (typeof value === 'string') {
    return parseDateRange(value, locale);
  } else if (typeof value === 'object') {
    return {
      ...value,
      startDate: parseISO(value.startDate),
      endDate: parseISO(value.endDate),
    };
  }
}

export default function useDateRange(websiteId) {
  const { locale } = useLocale();
  const websiteConfig = getWebsiteDateRange(websiteId);
  const defaultConfig = DEFAULT_DATE_RANGE;
  const globalConfig = useStore(state => state.dateRange);
  const dateRange = parseValue(websiteConfig || globalConfig || defaultConfig, locale);

  function saveDateRange(value) {
    if (websiteId) {
      setWebsiteDateRange(websiteId, value);
    } else {
      setItem(DATE_RANGE_CONFIG, value);
      setDateRange(value);
    }
  }

  return [dateRange, saveDateRange];
}
