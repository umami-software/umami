import { Button, Row } from '@umami/react-zen';
import { useState } from 'react';
import { useMessages } from '@/components/hooks';
import { DateFilter } from '@/components/input/DateFilter';
import { DATE_RANGE_CONFIG, DEFAULT_DATE_RANGE_VALUE } from '@/lib/constants';
import { getItem, setItem } from '@/lib/storage';

export function DateRangeSetting() {
  const { t, labels } = useMessages();
  const [date, setDate] = useState(getItem(DATE_RANGE_CONFIG) || DEFAULT_DATE_RANGE_VALUE);

  const handleChange = (value: string) => {
    setItem(DATE_RANGE_CONFIG, value);
    setDate(value);
  };

  const handleReset = () => {
    setItem(DATE_RANGE_CONFIG, DEFAULT_DATE_RANGE_VALUE);
    setDate(DEFAULT_DATE_RANGE_VALUE);
  };

  return (
    <Row gap="3">
      <DateFilter
        value={date}
        onChange={handleChange}
        placement="bottom start"
        style={{ minWidth: '250px' }}
      />
      <Button onPress={handleReset}>{t(labels.reset)}</Button>
    </Row>
  );
}
