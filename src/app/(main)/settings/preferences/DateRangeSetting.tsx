import { useState } from 'react';
import { DateFilter } from '@/components/input/DateFilter';
import { Button, Row } from '@umami/react-zen';
import { useMessages, usePreferences } from '@/components/hooks';
import { DATE_RANGE_CONFIG, DEFAULT_DATE_RANGE_VALUE } from '@/lib/constants';
import { setItem, getItem } from '@/lib/storage';

export function DateRangeSetting() {
  const { formatMessage, labels } = useMessages();
  const { updatePreferences } = usePreferences();
  const [date, setDate] = useState(getItem(DATE_RANGE_CONFIG) || DEFAULT_DATE_RANGE_VALUE);

  const handleChange = (value: string) => {
    setItem(DATE_RANGE_CONFIG, value);
    setDate(value);
    updatePreferences({ dateRange: value });
  };

  const handleReset = () => {
    setItem(DATE_RANGE_CONFIG, DEFAULT_DATE_RANGE_VALUE);
    setDate(DEFAULT_DATE_RANGE_VALUE);
    updatePreferences({ dateRange: null });
  };

  return (
    <Row gap="3">
      <DateFilter value={date} onChange={handleChange} placement="bottom start" />
      <Button onPress={handleReset}>{formatMessage(labels.reset)}</Button>
    </Row>
  );
}
