import { useDateRange, useNavigation } from '@/components/hooks';
import { getMonthDateRangeValue } from '@/lib/date';
import { MonthSelect } from './MonthSelect';

export function MonthFilter() {
  const { router, updateParams } = useNavigation();
  const {
    dateRange: { startDate },
  } = useDateRange();

  const handleMonthSelect = (date: Date) => {
    const range = getMonthDateRangeValue(date);

    router.push(updateParams({ date: range, offset: undefined }));
  };

  return <MonthSelect date={startDate} onChange={handleMonthSelect} />;
}
