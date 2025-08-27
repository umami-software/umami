import { DateFilter } from '@/components/input/DateFilter';
import { Button, Row } from '@umami/react-zen';
import { useDateRange, useMessages } from '@/components/hooks';
import { DEFAULT_DATE_RANGE_VALUE } from '@/lib/constants';

export function DateRangeSetting() {
  const { formatMessage, labels } = useMessages();
  const { dateRange, saveDateRange } = useDateRange();
  const { value } = dateRange;

  const handleChange = (value: string) => {
    saveDateRange(value);
  };
  const handleReset = () => saveDateRange(DEFAULT_DATE_RANGE_VALUE);

  return (
    <Row gap="3">
      <DateFilter value={value} onChange={handleChange} />
      <Button onPress={handleReset}>{formatMessage(labels.reset)}</Button>
    </Row>
  );
}
