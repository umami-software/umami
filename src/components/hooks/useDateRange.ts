import { getMinimumUnit, parseDateRange } from 'lib/date';
import { setItem } from 'next-basics';
import { DATE_RANGE_CONFIG, DEFAULT_DATE_RANGE } from 'lib/constants';
import websiteStore, { setWebsiteDateRange } from 'store/websites';
import appStore, { setDateRange } from 'store/app';
import { DateRange } from 'lib/types';
import useLocale from './useLocale';
import useApi from './useApi';

export function useDateRange(websiteId?: string) {
  const { get } = useApi();
  const { locale } = useLocale();
  const websiteConfig = websiteStore(state => state[websiteId]?.dateRange);
  const defaultConfig = DEFAULT_DATE_RANGE;
  const globalConfig = appStore(state => state.dateRange);
  const dateRange = parseDateRange(websiteConfig || globalConfig || defaultConfig, locale);

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

  return [dateRange, saveDateRange] as [
    { startDate: Date; endDate: Date; modified?: number },
    (value: string | DateRange) => void,
  ];
}

export default useDateRange;
