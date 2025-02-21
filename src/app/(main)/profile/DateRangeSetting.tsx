import DateFilter from '@/components/input/DateFilter';
import { Button, Flexbox } from 'react-basics';
import { useDateRange, useMessages } from '@/components/hooks';
import { DEFAULT_DATE_RANGE } from '@/lib/constants';
import { DateRange } from '@/lib/types';
import styles from './DateRangeSetting.module.css';

export function DateRangeSetting() {
  const { formatMessage, labels } = useMessages();
  const { dateRange, saveDateRange } = useDateRange();
  const { value } = dateRange;

  const handleChange = (value: string | DateRange) => saveDateRange(value);
  const handleReset = () => saveDateRange(DEFAULT_DATE_RANGE);

  return (
    <Flexbox gap={10} width={300}>
      <DateFilter
        className={styles.field}
        value={value}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onChange={handleChange}
      />
      <Button onClick={handleReset}>{formatMessage(labels.reset)}</Button>
    </Flexbox>
  );
}

export default DateRangeSetting;
