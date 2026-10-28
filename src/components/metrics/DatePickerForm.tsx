import { Button, Calendar, Column, Row, ToggleGroup, ToggleGroupItem } from '@umami/react-zen';
import { endOfDay, isAfter, isBefore, isSameDay, isValid, startOfDay } from 'date-fns';
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
}: {
  startDate: Date;
  endDate: Date;
  minDate?: Date;
  maxDate?: Date;
  onChange: (value: string) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<any>([
    isValid(defaultStartDate) &&
    isValid(defaultEndDate) &&
    isSameDay(defaultStartDate, defaultEndDate)
      ? FILTER_DAY
      : FILTER_RANGE,
  ]);
  const [date, setDate] = useState(isValid(defaultStartDate) ? defaultStartDate : new Date());
  const [startDate, setStartDate] = useState(
    isValid(defaultStartDate) ? defaultStartDate : new Date(),
  );
  const [endDate, setEndDate] = useState(isValid(defaultEndDate) ? defaultEndDate : new Date());
  const { t, labels } = useMessages();

  const isInvalidDate = !date || !isValid(date);
  const isInvalidRange =
    !startDate ||
    !endDate ||
    !isValid(startDate) ||
    !isValid(endDate) ||
    isAfter(startDate, endDate);

  const disabled = selected.includes(FILTER_DAY)
    ? isInvalidDate ||
      Boolean(minDate && isBefore(startOfDay(date), startOfDay(minDate))) ||
      Boolean(maxDate && isAfter(startOfDay(date), startOfDay(maxDate)))
    : isInvalidRange ||
      Boolean(minDate && isBefore(startOfDay(startDate), startOfDay(minDate))) ||
      Boolean(maxDate && isAfter(startOfDay(endDate), startOfDay(maxDate)));

  const handleSave = () => {
    if (disabled) {
      return;
    }

    if (selected.includes(FILTER_DAY)) {
      if (!isValid(date)) {
        return;
      }
      onChange(`range:${startOfDay(date).getTime()}:${endOfDay(date).getTime()}`);
    } else {
      if (!isValid(startDate) || !isValid(endDate)) {
        return;
      }
      onChange(`range:${startOfDay(startDate).getTime()}:${endOfDay(endDate).getTime()}`);
    }
  };

  return (
    <Column gap>
      <Row justifyContent="center">
        <ToggleGroup
          value={selected}
          onChange={value => {
            if (value.length) {
              setSelected(value);
            }
          }}
        >
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
            onChange={setDate}
            required
          />
        )}
        {selected.includes(FILTER_RANGE) && (
          <Row gap wrap="wrap" style={{ margin: '0 auto' }}>
            <Calendar
              value={startDate}
              minValue={minDate}
              maxValue={endDate || maxDate}
              onChange={setStartDate}
              required
            />
            <Calendar
              value={endDate}
              minValue={startDate || minDate}
              maxValue={maxDate}
              onChange={setEndDate}
              required
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
