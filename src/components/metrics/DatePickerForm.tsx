import { Button, Calendar, Column, Row, ToggleGroup, ToggleGroupItem } from '@umami/react-zen';
import { endOfDay, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';
import { useState } from 'react';
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
  const { t, labels } = useMessages();

  // Calendar calls onChange(undefined) when the selected day is clicked again; keep the current date.
  const keepDate = (setter: (date: Date) => void) => (value?: Date) => value && setter(value);

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
        <ToggleGroup value={selected} onChange={setSelected}>
          <ToggleGroupItem id={FILTER_DAY}>{t(labels.singleDay)}</ToggleGroupItem>
          <ToggleGroupItem id={FILTER_RANGE}>{t(labels.dateRange)}</ToggleGroupItem>
        </ToggleGroup>
      </Row>
      <Column>
        {selected.includes(FILTER_DAY) && (
          <Calendar
            value={date}
            minValue={minDate}
            maxValue={maxDate}
            onChange={keepDate(setDate)}
          />
        )}
        {selected.includes(FILTER_RANGE) && (
          <Row gap wrap="wrap" style={{ margin: '0 auto' }}>
            <Calendar
              value={startDate}
              minValue={minDate}
              maxValue={endDate}
              onChange={keepDate(setStartDate)}
            />
            <Calendar
              value={endDate}
              minValue={startDate}
              maxValue={maxDate}
              onChange={keepDate(setEndDate)}
            />
          </Row>
        )}
      </Column>
      <Row justifyContent="end" gap>
        <Button onPress={onClose}>{t(labels.cancel)}</Button>
        <Button variant="primary" onPress={handleSave} isDisabled={disabled}>
          {t(labels.apply)}
        </Button>
      </Row>
    </Column>
  );
}
