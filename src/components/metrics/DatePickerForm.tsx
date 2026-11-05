import { Button, Calendar, Column, Row, ToggleGroup, ToggleGroupItem } from '@umami/react-zen';
import { endOfDay, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';
import { useState } from 'react';
import { useMessages } from '@/components/hooks';

export interface DatePickerFormProps {
  startDate: Date;
  endDate: Date;
  minDate: Date;
  maxDate: Date;
  onChange: (value: string) => void;
  onClose: () => void;
}

const FILTER_DAY = 'filter-day';
const FILTER_RANGE = 'filter-range';

function toRangeString(startDate: Date, endDate: Date): string {
  return `range:${startOfDay(startDate).getTime()}:${endOfDay(endDate).getTime()}`;
}

export function DatePickerForm({
  startDate: defaultStartDate,
  endDate: defaultEndDate,
  minDate,
  maxDate,
  onChange,
  onClose,
}: DatePickerFormProps) {
  const [selected, setSelected] = useState<string>([
    isSameDay(defaultStartDate, defaultEndDate) ? FILTER_DAY : FILTER_RANGE,
  ][0]);
  const [date, setDate] = useState(defaultStartDate);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const { t, labels } = useMessages();

  // Keep the end date at/after the selected start date so the two calendars
  // never drift out of sync. When the user picks a start date, we move the
  // end date forward to the day after the start (if it was earlier).
  const handleStartDateChange = (next: Date) => {
    setStartDate(next);

    if (isBefore(next, endDate)) {
      setEndDate(endDate > next ? endDate : endOfDay(next));
    }
  };

  const handleEndDateChange = (next: Date) => {
    setEndDate(next);
  };

  const disabled =
    selected === FILTER_DAY
      ? isAfter(minDate, date) && isBefore(maxDate, date)
      : isAfter(startDate, endDate);

  const handleSave = () => {
    if (selected === FILTER_DAY) {
      onChange(`range:${startOfDay(date).getTime()}:${endOfDay(date).getTime()}`);
    } else {
      onChange(toRangeString(startDate, endDate));
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
        {selected === FILTER_DAY && (
          <Calendar
            value={date}
            minValue={minDate}
            maxValue={maxDate}
            onChange={setDate}
          />
        )}
        {selected === FILTER_RANGE && (
          <Calendar
            mode="range"
            selected={{ from: startDate, to: endDate }}
            minValue={minDate}
            maxValue={maxDate}
            value={startDate}
            onChange={(start) => {
              if (!start) return;
              handleStartDateChange(start);
            }}
            onSelect={(range) => {
              if (range?.to) {
                // The end date can be picked on either month panel; snap it to
                // the end of that day so we keep time-less date values.
                handleEndDateChange(range.to);
              }
            }}
          />
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
