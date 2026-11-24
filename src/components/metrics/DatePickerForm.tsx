import { Button, Calendar, Column, Row, ToggleGroup, ToggleGroupItem } from '@umami/react-zen';
import {
  endOfDay,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  min,
  startOfDay,
  subMonths,
} from 'date-fns';
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
  const rangeEndDate = endDate ?? startDate;

  const isInvalidDate = !date || !isValid(date);
  const isInvalidRange =
    !startDate ||
    !rangeEndDate ||
    !isValid(startDate) ||
    !isValid(rangeEndDate) ||
    isAfter(startDate, rangeEndDate);

  const disabledDays = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];

  const disabled = selected.includes(FILTER_DAY)
    ? isInvalidDate ||
      Boolean(minDate && isBefore(startOfDay(date), startOfDay(minDate))) ||
      Boolean(maxDate && isAfter(startOfDay(date), startOfDay(maxDate)))
    : isInvalidRange ||
      Boolean(minDate && isBefore(startOfDay(startDate), startOfDay(minDate))) ||
      Boolean(maxDate && isAfter(startOfDay(rangeEndDate), startOfDay(maxDate)));

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
      if (!isValid(startDate) || !isValid(rangeEndDate)) {
        return;
      }
      onChange(`range:${startOfDay(startDate).getTime()}:${endOfDay(rangeEndDate).getTime()}`);
    }
  };

  return (
    <Column gap>
      <Row justifyContent="center">
        <ToggleGroup
          value={selected}
          onValueChange={value => {
            if (value.length) {
              setSelected(value);
            }
          }}
        >
          <ToggleGroupItem value={FILTER_DAY}>{t(labels.singleDay)}</ToggleGroupItem>
          <ToggleGroupItem value={FILTER_RANGE}>{t(labels.dateRange)}</ToggleGroupItem>
        </ToggleGroup>
      </Row>
      <Column>
        {selected.includes(FILTER_DAY) && (
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            disabled={disabledDays}
            onSelect={setDate}
            required
          />
        )}
        {selected.includes(FILTER_RANGE) && (
          <Calendar
            mode="range"
            numberOfMonths={2}
            resetOnSelect
            selected={{ from: startDate, to: endDate }}
            defaultMonth={subMonths(min([rangeEndDate, new Date()]), 1)}
            showOutsideDays={false}
            disabled={disabledDays}
            onSelect={range => {
              setStartDate(range?.from);
              setEndDate(range?.to);
            }}
            required
            style={{ margin: '0 auto' }}
          />
        )}
      </Column>
      <Row justifyContent="end" gap>
        <Button variant="secondary" onClick={onClose}>
          {t(labels.cancel)}
        </Button>
        <Button onClick={handleSave} disabled={disabled}>
          {t(labels.apply)}
        </Button>
      </Row>
    </Column>
  );
}
