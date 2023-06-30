import { parseDateRange } from 'lib/date';
import { setItem } from 'next-basics';
import { DATE_RANGE_CONFIG, DEFAULT_DATE_RANGE } from 'lib/constants';
import useLocale from './useLocale';
import websiteStore, { setWebsiteDateRange } from 'store/websites';
import appStore, { setDateRange } from 'store/app';

export function useDateRange(websiteId) {
  const { locale } = useLocale();
  const websiteConfig = websiteStore(state => state[websiteId]?.dateRange);
  const defaultConfig = DEFAULT_DATE_RANGE;
  const globalConfig = appStore(state => state.dateRange);
  const dateRange = parseDateRange(websiteConfig || globalConfig || defaultConfig, locale);

  const saveDateRange = value => {
    if (websiteId) {
      setWebsiteDateRange(websiteId, value);
    } else {
      setItem(DATE_RANGE_CONFIG, value);
      setDateRange(value);
    }
  };

  return [dateRange, saveDateRange];
}

export default useDateRange;
