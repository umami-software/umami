import { DateFilter } from '@/components/input/DateFilter';
import { Button, Row } from '@umami/react-zen';
import { useDateRange, useMessages } from '@/components/hooks';
import { DEFAULT_DATE_RANGE } from '@/lib/constants';
import { DateRange } from '@/lib/types';

export function DateRangeSetting() {
  const { formatMessage, labels } = useMessages();
  const { dateRange, saveDateRange } = useDateRange();
  const { value } = dateRange;

  const handleChange = (value: string | DateRange) => saveDateRange(value);
  const handleReset = () => saveDateRange(DEFAULT_DATE_RANGE);

  return (
    <Row gap="3">
      <DateFilter
        value={value}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onChange={handleChange}
      />
      <Button onPress={handleReset}>{formatMessage(labels.reset)}</Button>
    </Row>
  );
}
