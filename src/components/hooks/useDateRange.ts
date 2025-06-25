import { getMinimumUnit, parseDateRange, getOffsetDateRange } from '@/lib/date';
import { setItem } from '@/lib/storage';
import { DATE_RANGE_CONFIG, DEFAULT_DATE_COMPARE, DEFAULT_DATE_RANGE_VALUE } from '@/lib/constants';
import { setWebsiteDateCompare, setWebsiteDateRange, useWebsites } from '@/store/websites';
import { setDateRangeValue, useApp } from '@/store/app';
import { useLocale } from './useLocale';
import { useApi } from './useApi';
import { useNavigation } from './useNavigation';
import { useMemo } from 'react';

export function useDateRange(websiteId?: string) {
  const { get } = useApi();
  const { locale } = useLocale();
  const {
    query: { date, offset = 0 },
  } = useNavigation();
  const websiteConfig = useWebsites(state => state[websiteId]?.dateRange);
  const globalConfig = useApp(state => state.dateRangeValue);
  const dateRangeObject = parseDateRange(
    date || websiteConfig?.value || globalConfig || DEFAULT_DATE_RANGE_VALUE,
    locale,
  );
  const dateRange = useMemo(
    () => (offset ? getOffsetDateRange(dateRangeObject, +offset) : dateRangeObject),
    [date, offset],
  );
  const dateCompare = useWebsites(state => state[websiteId]?.dateCompare || DEFAULT_DATE_COMPARE);

  const saveDateRange = async (value: string) => {
    if (websiteId) {
      if (value === 'all') {
        const result: any = await get(`/websites/${websiteId}/daterange`);
        const { mindate, maxdate } = result;

        const startDate = new Date(mindate);
        const endDate = new Date(maxdate);
        const unit = getMinimumUnit(startDate, endDate);

        setWebsiteDateRange(websiteId, {
          startDate,
          endDate,
          unit,
          value,
        });
      } else {
        setWebsiteDateRange(websiteId, parseDateRange(value, locale));
      }
    } else {
      setItem(DATE_RANGE_CONFIG, value);
      setDateRangeValue(value);
    }
  };

  const saveDateCompare = (value: string) => {
    setWebsiteDateCompare(websiteId, value);
  };

  return { dateRange, saveDateRange, dateCompare, saveDateCompare };
}
