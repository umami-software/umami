import { useDateRange } from '@/components/hooks';
import { dateToRangeValue } from '@/lib/date';
import { MonthSelect } from './MonthSelect';

export function WebsiteMonthSelect({ websiteId }: { websiteId: string }) {
  const {
    dateRange: { startDate },
    saveDateRange,
  } = useDateRange(websiteId);

  const handleMonthSelect = (date: Date) => {
    const range = dateToRangeValue(date);
    saveDateRange(range);
  };

  return <MonthSelect date={startDate} onChange={handleMonthSelect} />;
}
