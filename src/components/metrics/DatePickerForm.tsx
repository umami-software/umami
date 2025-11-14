import { useState } from 'react';
import { Button, Row, Column, Calendar, ToggleGroup, ToggleGroupItem } from '@umami/react-zen';
import { isAfter, isBefore, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { useMessages } from '@/components/hooks';

const FILTER_DAY = 'filter-day';
const FILTER_RANGE = 'filter-range';

export function DatePickerForm({
  startDate: defaultStartDate,
  endDate: defaultEndDate,
  minDate,
  maxDate,
  onChange,
  onClose,
}) {
  const [selected, setSelected] = useState<any>([
    isSameDay(defaultStartDate, defaultEndDate) ? FILTER_DAY : FILTER_RANGE,
  ]);
  const [date, setDate] = useState(defaultStartDate || new Date());
  const [startDate, setStartDate] = useState(defaultStartDate || new Date());
  const [endDate, setEndDate] = useState(defaultEndDate || new Date());
  const { formatMessage, labels } = useMessages();

  const disabled = selected.includes(FILTER_DAY)
    ? isAfter(minDate, date) && isBefore(maxDate, date)
    : isAfter(startDate, endDate);

  const handleSave = () => {
    if (selected.includes(FILTER_DAY)) {
      onChange(`range:${startOfDay(date).getTime()}:${endOfDay(date).getTime()}`);
    } else {
      onChange(`range:${startOfDay(startDate).getTime()}:${endOfDay(endDate).getTime()}`);
    }
  };

  return (
    <Column gap>
      <Row justifyContent="center">
        <ToggleGroup disallowEmptySelection value={selected} onChange={setSelected}>
          <ToggleGroupItem id={FILTER_DAY}>{formatMessage(labels.singleDay)}</ToggleGroupItem>
          <ToggleGroupItem id={FILTER_RANGE}>{formatMessage(labels.dateRange)}</ToggleGroupItem>
        </ToggleGroup>
      </Row>
      <Column>
        {selected.includes(FILTER_DAY) && (
          <Calendar value={date} minValue={minDate} maxValue={maxDate} onChange={setDate} />
        )}
        {selected.includes(FILTER_RANGE) && (
          <Row gap wrap="wrap" style={{ margin: '0 auto' }}>
            <Calendar
              value={startDate}
              minValue={minDate}
              maxValue={endDate}
              onChange={setStartDate}
            />
            <Calendar
              value={endDate}
              minValue={startDate}
              maxValue={maxDate}
              onChange={setEndDate}
            />
          </Row>
        )}
      </Column>
      <Row justifyContent="end" gap>
        <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>
        <Button variant="primary" onPress={handleSave} isDisabled={disabled}>
          {formatMessage(labels.apply)}
        </Button>
      </Row>
    </Column>
  );
}
