import { getMinimumUnit, parseDateRange } from '@/lib/date';
import { useLocale } from '@/components/hooks/useLocale';
import { useApi } from '@/components/hooks//useApi';
import { useQueryStringDate } from '@/components/hooks/useQueryStringDate';
import { useGlobalState } from '@/components/hooks/useGlobalState';

export function useDateRange(websiteId: string) {
  const { get } = useApi();
  const { locale } = useLocale();
  const { dateRange: defaultDateRange, dateCompare } = useQueryStringDate();

  const [dateRange, setDateRange] = useGlobalState(`date-range:${websiteId}`, defaultDateRange);

  const setDateRangeValue = async (value: string) => {
    if (value === 'all') {
      const result = await get(`/websites/${websiteId}/daterange`);
      const { mindate, maxdate } = result;

      const startDate = new Date(mindate);
      const endDate = new Date(maxdate);
      const unit = getMinimumUnit(startDate, endDate);

      setDateRange({
        startDate,
        endDate,
        unit,
        value,
      });
    } else {
      setDateRange(parseDateRange(value, locale));
    }
  };

  return { dateRange, dateCompare, setDateRange, setDateRangeValue };
}
