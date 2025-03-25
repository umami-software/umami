import { getMinimumUnit, parseDateRange } from '@/lib/date';
import { setItem } from '@/lib/storage';
import { DATE_RANGE_CONFIG, DEFAULT_DATE_COMPARE, DEFAULT_DATE_RANGE } from '@/lib/constants';
import websiteStore, { setWebsiteDateRange, setWebsiteDateCompare } from '@/store/websites';
import appStore, { setDateRange } from '@/store/app';
import { DateRange } from '@/lib/types';
import { useLocale } from './useLocale';
import { useApi } from './useApi';

export function useDateRange(websiteId?: string): {
  dateRange: DateRange;
  saveDateRange: (value: string | DateRange) => void;
  dateCompare: string;
  saveDateCompare: (value: string) => void;
} {
  const { get } = useApi();
  const { locale } = useLocale();
  const websiteConfig = websiteStore(state => state[websiteId]?.dateRange);
  const defaultConfig = DEFAULT_DATE_RANGE;
  const globalConfig = appStore(state => state.dateRange);
  const dateRange = parseDateRange(websiteConfig || globalConfig || defaultConfig, locale);
  const dateCompare = websiteStore(state => state[websiteId]?.dateCompare || DEFAULT_DATE_COMPARE);

  const saveDateRange = async (value: DateRange | string) => {
    if (websiteId) {
      let dateRange: DateRange | string = value;

      if (typeof value === 'string') {
        if (value === 'all') {
          const result: any = await get(`/websites/${websiteId}/daterange`);
          const { mindate, maxdate } = result;

          const startDate = new Date(mindate);
          const endDate = new Date(maxdate);

          dateRange = {
            startDate,
            endDate,
            unit: getMinimumUnit(startDate, endDate),
            value,
          };
        } else {
          dateRange = parseDateRange(value, locale);
        }
      }

      setWebsiteDateRange(websiteId, dateRange as DateRange);
    } else {
      setItem(DATE_RANGE_CONFIG, value);
      setDateRange(value);
    }
  };

  const saveDateCompare = (value: string) => {
    setWebsiteDateCompare(websiteId, value);
  };

  return { dateRange, saveDateRange, dateCompare, saveDateCompare };
}

export default useDateRange;
